import asyncio
import smtplib
import logging
import secrets
import string
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from ..core.config import settings

logger = logging.getLogger(__name__)


def generate_temporary_password(length: int = 12) -> str:
    """Generate a secure random temporary password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    # Ensure at least one uppercase, lowercase, digit, and special char
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("!@#$%^&*"),
    ]
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)


def _send_email_sync(to_email: str, subject: str, html_content: str, text_content: str, attachment_paths: list[str] = None) -> None:
    """Synchronous SMTP send, run in thread."""
    msg = MIMEMultipart('mixed')
    
    # Body part
    body = MIMEMultipart('alternative')
    body.attach(MIMEText(text_content, 'plain'))
    body.attach(MIMEText(html_content, 'html'))
    msg.attach(body)

    msg['From'] = settings.FROM_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject

    if attachment_paths:
        for path in attachment_paths:
            if path and os.path.exists(path):
                filename = os.path.basename(path)
                try:
                    with open(path, 'rb') as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
                        msg.attach(part)
                except Exception as ex:
                    logger.error(f"Failed to attach file {path}: {ex}")

    if settings.SMTP_USE_TLS:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
    else:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()
    logger.info(f"✉️  Email sent to {to_email}: {subject}")


async def send_email_via_smtp(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
    attachment_paths: list[str] = None
) -> bool:
    """Send email asynchronously. Returns True on success, False on failure."""
    try:
        await asyncio.to_thread(_send_email_sync, to_email, subject, html_content, text_content, attachment_paths)
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {type(e).__name__}: {e}")
        return False


async def send_welcome_email(
    recipient_email: str,
    recipient_name: str,
    temporary_password: str,
    role: str
) -> None:
    """Send welcome email with login credentials to a newly created user."""
    subject = "Welcome to Veeva Vault Hub — Your Login Credentials"

    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 32px 24px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 1.5rem; font-weight: 700;">Veeva Vault Hub</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.9rem;">Your knowledge hub for Veeva Vault</p>
            </div>
            <div style="padding: 32px 24px;">
                <h2 style="color: #1a202c; margin-top: 0;">Welcome, {recipient_name}! 👋</h2>
                <p style="color: #4a5568;">Your account has been created successfully with the <strong>{role}</strong> role.</p>
                <p style="color: #4a5568;">Here are your login credentials:</p>
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 0.875rem;">📧 Email</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #1a202c;">{recipient_email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 0.875rem;">🔑 Password</td>
                            <td style="padding: 6px 0;">
                                <code style="background: #e2e8f0; padding: 4px 10px; border-radius: 4px; font-size: 1rem; color: #1a202c; font-weight: 700; letter-spacing: 1px;">{temporary_password}</code>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
                        ⚠️ <strong>Important:</strong> This is a temporary password. Please change it after your first login for security.
                    </p>
                </div>
                <a href="http://localhost:3000/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #0f766e, #0891b2); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 8px;">
                    Sign In Now →
                </a>
            </div>
            <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 0.75rem; margin: 0;">
                    This is an automated email from Veeva Vault Hub. Please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
Welcome to Veeva Vault Hub!

Hi {recipient_name},

Your account has been created with the role: {role}

LOGIN CREDENTIALS:
  Email:    {recipient_email}
  Password: {temporary_password}

IMPORTANT: Please change your password after first login.

Access the portal at: http://localhost:3000/login

---
This is an automated email. Please do not reply.
    """.strip()

    success = await send_email_via_smtp(recipient_email, subject, html_content, text_content)
    if not success:
        logger.warning(f"Welcome email could not be delivered to {recipient_email}. Check SMTP settings.")


async def send_query_notification(
    interview_title: str,
    sender_name: str,
    sender_email: str,
    phone_number: str,
    message: str,
    recipient_emails: list[str],
    image_path: str = None,
    file_path: str = None
) -> None:
    """Send query notification emails to all admin users."""
    if not recipient_emails:
        logger.warning("No recipient emails for query notification")
        return

    subject = f"📨 New Query on: {interview_title}"

    # Build attachments list
    attachments = []
    if image_path:
        attachments.append(image_path)
    if file_path:
        attachments.append(file_path)

    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 24px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 1.25rem; font-weight: 700;">New Query Received</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 0.875rem;">Veeva Vault Hub</p>
            </div>
            <div style="padding: 28px 24px;">
                <div style="background: #f0f9ff; border-left: 4px solid #0891b2; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 0.875rem; color: #64748b;">Interview</p>
                    <p style="margin: 4px 0 0; font-size: 1rem; font-weight: 600; color: #1a202c;">{interview_title}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem; width: 120px;">👤 From</td>
                        <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">{sender_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">📧 Email</td>
                        <td style="padding: 8px 0;"><a href="mailto:{sender_email}" style="color: #0891b2;">{sender_email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 0.875rem;">📞 Phone</td>
                        <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">{phone_number}</td>
                    </tr>
                </table>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 8px; font-size: 0.875rem; font-weight: 600; color: #374151;">💬 Message</p>
                    <p style="margin: 0; color: #4b5563; line-height: 1.6;">{message}</p>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="http://localhost:3000/admin/interviews"
                       style="display: inline-block; background: linear-gradient(135deg, #0f766e, #0891b2); color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.875rem;">
                        View in Admin Dashboard →
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
New Query Received on Veeva Vault Hub

Interview: {interview_title}
From:      {sender_name} <{sender_email}>
Phone:     {phone_number}

Message:
{message}

---
View in admin: http://localhost:3000/admin/interviews
    """.strip()

    tasks = [
        send_email_via_smtp(recipient, subject, html_content, text_content, attachments)
        for recipient in recipient_emails
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    success_count = sum(1 for r in results if r is True)
    logger.info(f"Query notification sent to {success_count}/{len(recipient_emails)} recipients")


async def send_reply_notification(
    recipient_email: str,
    recipient_name: str,
    message: str,
    reply_author_name: str,
    interview_title: str
) -> None:
    """Send an email notification to the query creator when a reply is posted."""
    subject = f"💬 New Answer to your query on: {interview_title}"
    
    html_content = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%); padding: 24px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 1.25rem; font-weight: 700;">Query Answered</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 0.875rem;">Veeva Vault Hub</p>
            </div>
            <div style="padding: 28px 24px;">
                <p>Hello {recipient_name},</p>
                <p>A registered user has replied to your query regarding the interview <strong>{interview_title}</strong>.</p>
                
                <div style="background: #f8fafc; border-left: 4px solid #fd7e14; border-radius: 0 8px 8px 0; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 6px; font-size: 0.85rem; font-weight: 600; color: #64748b;">Answered by {reply_author_name}:</p>
                    <p style="margin: 0; color: #1a202c; line-height: 1.6;">{message}</p>
                </div>
                
                <p style="font-size: 0.85rem; color: #64748b;">You can view the full discussion thread on the portal.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
Hello {recipient_name},

A registered user ({reply_author_name}) has replied to your query regarding the interview "{interview_title}".

Answer:
{message}

---
Veeva Vault Hub
    """.strip()

    await send_email_via_smtp(recipient_email, subject, html_content, text_content)
