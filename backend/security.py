"""Small, shared security helpers for untrusted application content."""

from __future__ import annotations

import io
import html
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

try:
    import bleach
except ImportError:  # Keep local SIT usable before dependencies are refreshed.
    bleach = None

try:
    from bleach.css_sanitizer import CSSSanitizer
except ImportError:
    CSSSanitizer = None


RICH_TEXT_TAGS = {
    "a", "b", "br", "div", "em", "font", "h1", "h2", "h3", "h4",
    "i", "li", "ol", "p", "s", "span", "strike", "strong", "sub",
    "sup", "u", "ul", "blockquote",
}
RICH_TEXT_ATTRIBUTES = {
    "a": ["href", "title", "target", "rel"],
    # These are the inert attributes emitted by the editor's font and colour
    # controls.  Keeping them avoids losing formatting during sanitization.
    "font": ["color", "face"],
    "span": ["class"],
    "*": ["style"],
}
RICH_TEXT_PROTOCOLS = {"http", "https", "mailto"}
RICH_TEXT_CSS_PROPERTIES = {
    "color",
    "background-color",
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "margin-left",
    "text-align",
    "text-decoration",
}
RICH_TEXT_CSS_SANITIZER = (
    CSSSanitizer(allowed_css_properties=RICH_TEXT_CSS_PROPERTIES)
    if CSSSanitizer is not None
    else None
)


def sanitizer_status() -> dict[str, str | bool]:
    if bleach is None:
        return {
            "implementation": "fallback",
            "version": "built-in",
            "full_protection": False,
        }
    if CSSSanitizer is None:
        return {
            "implementation": "bleach-without-css-sanitizer",
            "version": str(getattr(bleach, "__version__", "installed")),
            "full_protection": False,
        }
    return {
        "implementation": "bleach",
        "version": str(getattr(bleach, "__version__", "installed")),
        "full_protection": True,
    }


def sanitize_rich_text(value: str | None) -> str | None:
    if value is None:
        return None
    if bleach is None:
        return _fallback_sanitize_rich_text(str(value))
    attributes = RICH_TEXT_ATTRIBUTES
    if CSSSanitizer is None:
        attributes = {
            tag: [attribute for attribute in allowed if attribute != "style"]
            for tag, allowed in RICH_TEXT_ATTRIBUTES.items()
        }
    return bleach.clean(
        str(value),
        tags=RICH_TEXT_TAGS,
        attributes=attributes,
        protocols=RICH_TEXT_PROTOCOLS,
        strip=True,
        strip_comments=True,
        css_sanitizer=RICH_TEXT_CSS_SANITIZER,
    )


class _FallbackRichTextSanitizer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output: list[str] = []
        self.drop_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "form"}:
            self.drop_depth += 1
            return
        if self.drop_depth or tag not in RICH_TEXT_TAGS:
            return
        allowed = []
        allowed_names = set(RICH_TEXT_ATTRIBUTES.get(tag, [])) | set(RICH_TEXT_ATTRIBUTES.get("*", []))
        for name, attr_value in attrs:
            name = name.lower()
            if name not in allowed_names or attr_value is None:
                continue
            if name == "href":
                scheme = urlsplit(attr_value.strip()).scheme.lower()
                if scheme not in RICH_TEXT_PROTOCOLS and scheme:
                    continue
            if name == "style":
                attr_value = _fallback_sanitize_style(attr_value)
                if not attr_value:
                    continue
            allowed.append(f' {name}="{html.escape(attr_value, quote=True)}"')
        self.output.append(f"<{tag}{''.join(allowed)}>")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "form"}:
            self.drop_depth = max(0, self.drop_depth - 1)
            return
        if not self.drop_depth and tag in RICH_TEXT_TAGS and tag not in {"br"}:
            self.output.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.drop_depth:
            self.output.append(html.escape(data))


def _fallback_sanitize_rich_text(value: str) -> str:
    parser = _FallbackRichTextSanitizer()
    parser.feed(value)
    parser.close()
    return "".join(parser.output)


def _fallback_sanitize_style(value: str) -> str:
    declarations = []
    for declaration in str(value).split(";"):
        if ":" not in declaration:
            continue
        property_name, property_value = declaration.split(":", 1)
        property_name = property_name.strip().lower()
        property_value = property_value.strip()
        lowered_value = property_value.lower()
        if (
            property_name not in RICH_TEXT_CSS_PROPERTIES
            or not property_value
            or any(token in lowered_value for token in ("url(", "expression(", "javascript:", "@import"))
        ):
            continue
        declarations.append(f"{property_name}: {property_value}")
    return "; ".join(declarations)


def validate_zip_members(archive_bytes: bytes) -> None:
    """Reject absolute paths and members escaping the extraction directory."""
    with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as archive:
        for member in archive.infolist():
            member_path = Path(member.filename.replace("\\", "/"))
            if member_path.is_absolute() or ".." in member_path.parts:
                raise ValueError("Backup archive contains an unsafe path.")
