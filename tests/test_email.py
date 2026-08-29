import smtplib
from unittest.mock import patch

from backend.email import SMTPConfig, send_email


def test_send_email_does_not_connect_when_smtp_is_unconfigured():
    config = SMTPConfig()

    with patch.object(smtplib, "SMTP") as smtp:
        assert send_email("recipient@example.test", "Subject", "Body", config=config) is False

    smtp.assert_not_called()


def test_send_email_uses_generic_smtp_configuration():
    config = SMTPConfig(
        host="smtp.example.test",
        port=587,
        username="user",
        password="password",
        use_tls=True,
        from_address="catalogue@example.test",
    )

    with patch.object(smtplib, "SMTP") as smtp_class:
        smtp = smtp_class.return_value.__enter__.return_value
        assert send_email("recipient@example.test", "Subject", "Body", config=config) is True

    smtp_class.assert_called_once_with("smtp.example.test", 587, timeout=20)
    smtp.starttls.assert_called_once()
    smtp.login.assert_called_once_with("user", "password")
    smtp.send_message.assert_called_once()
