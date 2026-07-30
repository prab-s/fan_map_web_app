import io
import zipfile

import pytest

from backend.security import sanitize_rich_text, validate_zip_members
from backend.schemas import SeriesResponse


def test_rich_text_sanitizer_removes_script_and_javascript_urls():
    cleaned = sanitize_rich_text(
        '<p>Safe</p><script>alert(1)</script>'
        '<a href="javascript:alert(1)" onclick="alert(2)">link</a>'
    )

    assert "script" not in cleaned.lower()
    assert "onclick" not in cleaned.lower()
    assert "javascript:" not in cleaned.lower()
    assert "Safe" in cleaned


def test_rich_text_sanitizer_keeps_editor_font_formatting():
    cleaned = sanitize_rich_text(
        '<p><font face="Arial" color="#732323">Contents</font></p>'
    )

    assert cleaned == '<p><font face="Arial" color="#732323">Contents</font></p>'


def test_rich_text_sanitizer_keeps_all_editor_inline_formatting():
    cleaned = sanitize_rich_text(
        '<p><b>bold</b> <strong>strong</strong> '
        '<i>italic</i> <em>emphasis</em> '
        '<u>underline</u> <strike>strike</strike> <s>strikethrough</s></p>'
    )

    assert cleaned == (
        '<p><b>bold</b> <strong>strong</strong> '
        '<i>italic</i> <em>emphasis</em> '
        '<u>underline</u> <strike>strike</strike> <s>strikethrough</s></p>'
    )


def test_rich_text_sanitizer_keeps_safe_editor_styles_and_removes_unsafe_css():
    cleaned = sanitize_rich_text(
        '<p><span style="font-weight: bold; font-style: italic; '
        'text-decoration: line-through; color: #732323; '
        'background-image: url(javascript:alert(1))">styled</span></p>'
    )

    assert 'font-weight: bold' in cleaned
    assert 'font-style: italic' in cleaned
    assert 'text-decoration: line-through' in cleaned
    assert 'color: #732323' in cleaned
    assert 'background-image' not in cleaned
    assert 'javascript:' not in cleaned.lower()


def test_series_response_exposes_contents_description_for_editor_hydration():
    response = SeriesResponse.model_validate({
        "id": 7,
        "name": "Example",
        "contents_description": "<p>Shown on the contents page.</p>",
    })

    assert response.contents_description == "<p>Shown on the contents page.</p>"


def test_zip_member_validation_rejects_zip_slip():
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("../../outside.txt", "unsafe")

    with pytest.raises(ValueError, match="unsafe path"):
        validate_zip_members(output.getvalue())


def test_zip_member_validation_accepts_expected_relative_paths():
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.writestr("data/product_images/image.png", "safe")

    validate_zip_members(output.getvalue())
