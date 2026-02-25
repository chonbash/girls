import asyncio
from app.config import settings


async def send_code_email(to_email: str, code: str, girl_name: str) -> None:
    """Send access code to email. Uses SMTP.BZ API if SMTP_BZ_API_KEY is set, else SMTP or stub."""
    if settings.smtp_bz_api_key:
        await _send_via_smtpbz(to_email, code, girl_name)
        return
    if not settings.smtp_host:
        # Development: just log
        print(f"[EMAIL STUB] To: {to_email}, code: {code}, name: {girl_name}")
        return
    await _send_via_smtp(to_email, code, girl_name)


def _code_email_text(girl_name: str, code: str) -> str:
    return (
        f"Привет, {girl_name}!\n\n"
        f"Твой код доступа: {code}\n\n"
        f"Код действителен 24 часа.\n\n"
        f"С праздником!"
    )


def _code_email_html(girl_name: str, code: str) -> str:
    name_escaped = girl_name.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Код доступа — 8 Марта</title>
</head>
<body style="margin:0; padding:0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); min-height: 100vh;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
    <tr>
      <td align="center" style="padding: 2rem 1rem;">
        <table role="presentation" width="100%" style="max-width: 360px; background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 2rem 1.5rem;">
              <h1 style="margin: 0 0 1rem; font-size: 1.25rem; font-weight: 600; color: #c44569; text-align: center;">Код доступа — 8 Марта</h1>
              <p style="margin: 0 0 1.5rem; font-size: 1.1rem; color: #333; text-align: center;">Привет, {name_escaped}!</p>
              <p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: #666; text-align: center;">Твой код доступа:</p>
              <p style="margin: 0 0 1.5rem; text-align: center;">
                <span style="display: inline-block; padding: 0.75rem 1.5rem; background: #c44569; color: #fff; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.2em; border-radius: 10px;">{code}</span>
              </p>
              <p style="margin: 0 0 1rem; font-size: 0.85rem; color: #666; text-align: center;">Код действителен 24 часа.</p>
              <p style="margin: 0; font-size: 1rem; font-weight: 600; color: #c44569; text-align: center;">С праздником!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


async def _send_via_smtpbz(to_email: str, code: str, girl_name: str) -> None:
    """Send via SMTP.BZ REST API: POST https://api.smtp.bz/v1/smtp/send (multipart/form-data)."""
    import httpx

    url = "https://api.smtp.bz/v1/smtp/send"
    # SMTP.BZ expects raw API key in Authorization header, not "Bearer <key>" (Swagger: apiKey in header)
    headers = {"Authorization": settings.smtp_bz_api_key.strip()}
    data = {
        "from": settings.smtp_from,
        "subject": "Код доступа — 8 Марта",
        "to": to_email,
        "to_name": girl_name,
        "html": _code_email_html(girl_name, code),
        "text": _code_email_text(girl_name, code),
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, data=data, headers=headers)
        resp.raise_for_status()


async def _send_via_smtp(to_email: str, code: str, girl_name: str) -> None:
    """Send via classic SMTP (aiosmtplib)."""
    try:
        import aiosmtplib
        from email.message import EmailMessage

        msg = EmailMessage()
        msg["Subject"] = "Код доступа — 8 Марта"
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        msg.set_content(_code_email_text(girl_name, code))
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
