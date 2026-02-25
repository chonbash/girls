import asyncio
from app.config import settings


async def send_code_email(to_email: str, code: str, girl_name: str) -> None:
    """Send access code to email. Stub logs if SMTP not configured."""
    if not settings.smtp_host:
        # Development: just log
        print(f"[EMAIL STUB] To: {to_email}, code: {code}, name: {girl_name}")
        return
    try:
        import aiosmtplib
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["Subject"] = "Код доступа — 8 Марта"
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        msg.set_content(
            f"Привет, {girl_name}!\n\n"
            f"Твой код доступа: {code}\n\n"
            f"Код действителен 24 часа.\n\n"
            f"С праздником!"
        )
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_password or None,
            use_tls=True,
        )
    except Exception as e:
        print(f"Send email error: {e}")
        raise
