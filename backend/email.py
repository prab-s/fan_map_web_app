"""Small, provider-neutral SMTP email abstraction."""

from __future__ import annotations

import os
import base64
import hashlib
import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage
from collections.abc import Sequence

from cryptography.fernet import Fernet


_TRUE_VALUES = {"1", "true", "yes", "on"}


def _env_flag(value: str) -> bool:
    return value.strip().lower() in _TRUE_VALUES


@dataclass(frozen=True)
class SMTPConfig:
    host: str = ""
    port: int = 587
    username: str = ""
    password: str = ""
    use_tls: bool = True
    from_address: str = ""

    @classmethod
    def from_environment(cls) -> "SMTPConfig":
        port_value = os.getenv("SMTP_PORT", "587").strip() or "587"
        try:
            port = int(port_value)
        except ValueError as exc:
            raise ValueError("SMTP_PORT must be an integer") from exc

        return cls(
            host=os.getenv("SMTP_HOST", "").strip(),
            port=port,
            username=os.getenv("SMTP_USERNAME", "").strip(),
            password=os.getenv("SMTP_PASSWORD", ""),
            use_tls=_env_flag(os.getenv("SMTP_USE_TLS", "true")),
            from_address=os.getenv("SMTP_FROM_ADDRESS", "").strip(),
        )

    @property
    def is_configured(self) -> bool:
        if not self.host or not self.from_address or self.port <= 0:
            return False
        return bool(self.username) == bool(self.password)


def _fernet(secret: str | None = None) -> Fernet:
    application_secret = secret if secret is not None else os.getenv("SESSION_SECRET", "")
    if not application_secret:
        raise ValueError("SESSION_SECRET is required to protect SMTP credentials")
    key = base64.urlsafe_b64encode(hashlib.sha256(application_secret.encode("utf-8")).digest())
    return Fernet(key)


def encrypt_smtp_password(password: str, secret: str | None = None) -> str:
    return _fernet(secret).encrypt(password.encode("utf-8")).decode("ascii")


def decrypt_smtp_password(encrypted_password: str | None, secret: str | None = None) -> str:
    if not encrypted_password:
        return ""
    return _fernet(secret).decrypt(encrypted_password.encode("ascii")).decode("utf-8")


def send_email(
    recipient: str | Sequence[str],
    subject: str,
    body: str,
    *,
    reply_to: str | None = None,
    config: SMTPConfig | None = None,
) -> bool:
    """Send a plain-text email, or return False without connecting if unconfigured."""
    smtp = config or SMTPConfig.from_environment()
    if not smtp.is_configured:
        return False

    recipients = [recipient] if isinstance(recipient, str) else list(recipient)
    recipients = [address.strip() for address in recipients if address.strip()]
    if not recipients:
        raise ValueError("At least one email recipient is required")

    message = EmailMessage()
    message["To"] = ", ".join(recipients)
    message["From"] = smtp.from_address
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP(smtp.host, smtp.port, timeout=20) as server:
        server.ehlo()
        if smtp.use_tls:
            server.starttls(context=context)
            server.ehlo()
        if smtp.username:
            server.login(smtp.username, smtp.password)
        server.send_message(message)
    return True
