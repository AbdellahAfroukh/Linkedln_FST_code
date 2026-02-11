"""
Email service for sending verification and notification emails
Uses Gmail SMTP for simplicity
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Gmail SMTP"""
    
    @staticmethod
    def send_verification_email(email: str, verification_token: str, full_name: str = "User") -> bool:
        """
        Send email verification link to user
        
        Args:
            email: User's email address
            verification_token: Token for email verification
            full_name: User's full name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Construct verification link
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
            
            # Create email content
            subject = "Verify your email address - Academic Platform"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Welcome to Academic Platform!</h2>
                        <p>Hi {full_name},</p>
                        
                        <p>Thank you for registering. Please verify your email address to activate your account.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{verification_url}" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #666;">{verification_url}</p>
                        
                        <p>This verification link will expire in 24 hours.</p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="font-size: 12px; color: #999;">
                            If you didn't create an account, please ignore this email.
                        </p>
                        
                        <p style="font-size: 12px; color: #999;">
                            Best regards,<br>Academic Platform Team
                        </p>
                    </div>
                </body>
            </html>
            """
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.SMTP_USER
            message["To"] = email
            
            # Attach HTML content
            message.attach(MIMEText(html_content, "html"))
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            logger.info(f"Verification email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(email: str, full_name: str = "User") -> bool:
        """
        Send welcome email after successful verification
        
        Args:
            email: User's email address
            full_name: User's full name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            subject = "Welcome to Academic Platform!"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Your account is verified!</h2>
                        <p>Hi {full_name},</p>
                        
                        <p>Your email has been successfully verified. You can now log in to your account.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/login" 
                               style="background-color: #28a745; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Go to Login
                            </a>
                        </div>
                        
                        <h3>What's next?</h3>
                        <ul>
                            <li>Complete your profile</li>
                            <li>Connect with other researchers</li>
                            <li>Share your publications</li>
                            <li>Set up two-factor authentication for security</li>
                        </ul>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="font-size: 12px; color: #999;">
                            Best regards,<br>Academic Platform Team
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.SMTP_USER
            message["To"] = email
            
            message.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(EmailService.SMTP_HOST, EmailService.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            logger.info(f"Welcome email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
