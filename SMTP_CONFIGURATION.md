# SMTP Configuration Guide - Direct in config.py

## Overview

SMTP (Simple Mail Transfer Protocol) is configured directly in `backend/config.py` instead of using `.env` file.

## Current Configuration in config.py

```python
# Email Settings (Outlook SMTP - Simple, no app password needed!)
SMTP_USER: str = "your-email@outlook.com"         # Your Outlook email
SMTP_PASSWORD: str = "your-outlook-password"      # Your regular Outlook password
SMTP_HOST: str = "smtp-mail.outlook.com"          # Outlook SMTP server
SMTP_PORT: int = 587                              # Outlook SMTP port (TLS)
FRONTEND_URL: str = "http://localhost:5173"       # Frontend URL for email links
EMAIL_VERIFICATION_EXPIRY_HOURS: int = 24         # Token expires in 24 hours
```

**✅ Can send to ANY email**: Gmail, Yahoo, Hotmail, etc. - all work!

---

## How to Setup Outlook SMTP (Simple!)

### Step 1: Enable SMTP Authentication in Outlook (REQUIRED!)

**You must enable this first or you'll get authentication errors!**

1. Go to **https://outlook.live.com/mail/0/options/mail/accounts**
   - OR: Open Outlook → Click gear icon ⚙️ → **View all Outlook settings** → **Mail** → **Sync email**

2. Scroll down to **POP and IMAP** section

3. Find **"Let devices and apps use POP"**
   - Set to: **Yes** ✅

4. Find **"Authenticated SMTP"**
   - Set to: **Enabled** ✅

5. Click **Save**

**Screenshot location**: Settings → Mail → Sync email → Enable SMTP

### Step 2: Update config.py

Just replace with your Outlook credentials:

```python
SMTP_USER: str = "academic.plateform@outlook.com"            # Your Outlook email
SMTP_PASSWORD: str = "Academic@Plateform"             # Your regular password
SMTP_HOST: str = "smtp-mail.outlook.com"
SMTP_PORT: int = 587
```

**Example:**

```python
SMTP_USER: str = "john.doe@outlook.com"
SMTP_PASSWORD: str = "MyPassword123"
SMTP_HOST: str = "smtp-mail.outlook.com"
SMTP_PORT: int = 587
```

**That's it!** No 2FA, no app password, no phone number needed.

### Step 3: Test (Optional)

Run the test script below to verify it works.

---

## SMTP Server Details

| Setting           | Value                   | Description                   |
| ----------------- | ----------------------- | ----------------------------- |
| **SMTP_HOST**     | `smtp-mail.outlook.com` | Outlook's SMTP server         |
| **SMTP_PORT**     | `587`                   | Port with TLS encryption      |
| **SMTP_USER**     | Your Outlook email      | Your Outlook email address    |
| **SMTP_PASSWORD** | Your password           | Your regular Outlook password |
| **Security**      | TLS                     | Encrypted connection          |

**Can send to**: Gmail, Yahoo, Hotmail, any email domain ✅

---

## Test SMTP Connection

Run this Python script to test if SMTP works:

```python
import smtplib
from config import settings

try:
    # Create SMTP connection
    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
    server.starttls()  # Enable TLS

    # Try to login
    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    print("✅ SMTP connection successful!")

    server.quit()
except smtplib.SMTPAuthenticationError:
    print("❌ Authentication failed - check SMTP_USER and SMTP_PASSWORD")
except smtplib.SMTPException as e:
    print(f"❌ SMTP error: {e}")
except Exception as e:
    print(f"❌ Connection error: {e}")
```

---

## Configuration for Different Email Providers

### Gmail (Alternative - requires app password)

```python
SMTP_HOST: str = "smtp.gmail.com"
SMTP_PORT: int = 587
SMTP_USER: str = "your-email@gmail.com"
SMTP_PASSWORD: str = "your-app-password"  # Requires 2FA + app password
```

### Outlook/Microsoft (Current Setup ✅)

```python
SMTP_HOST: str = "smtp-mail.outlook.com"
SMTP_PORT: int = 587
SMTP_USER: str = "your-email@outlook.com"
SMTP_PASSWORD: str = "your-regular-password"  # Just your normal password!
```

### Yahoo Mail

```python
SMTP_HOST: str = "smtp.mail.yahoo.com"
SMTP_PORT: int = 587
SMTP_USER: str = "your-email@yahoo.com"
SMTP_PASSWORD: str = "your-app-password"
```

### SendGrid (Recommended for Production)

```python
SMTP_HOST: str = "smtp.sendgrid.net"
SMTP_PORT: int = 587
SMTP_USER: str = "apikey"  # Literal string "apikey"
SMTP_PASSWORD: str = "SG.xxxxxxxxxxxx"  # Your SendGrid API key
```

---

## Troubleshooting

### ❌ "SmtpClientAuthentication is disabled" (Most Common!)

**Error**: `535, b'5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled`

**Solution**:

1. Go to **https://outlook.live.com/mail/0/options/mail/accounts**
2. Click **Sync email** (left sidebar)
3. Scroll to **POP and IMAP** section
4. Enable **"Authenticated SMTP"** ✅
5. Click **Save**
6. Wait 5 minutes for changes to apply
7. Try again

### ❌ "Authentication failed"

- Check `SMTP_USER` is correct Outlook email address
- Check `SMTP_PASSWORD` is your correct Outlook password
- Verify **Authenticated SMTP is enabled** (see above)
- Try logging into Outlook webmail to verify credentials work

### ❌ "Connection refused"

- Check `SMTP_HOST` is correct: `smtp-mail.outlook.com`
- Check `SMTP_PORT` is correct: `587`
- Verify your firewall allows port 587

### ❌ "Email not sent"

- Check logs for error message
- Verify all SMTP settings are correct
- Test with the test script above first

### ❌ "Less secure apps blocked"

- Gmail blocks apps that don't use OAuth
- **Solution**: Use an **App Password** (not regular password)
- This requires 2FA to be enabled

---

## File Changes Made

- ✅ `backend/config.py` - Added SMTP_HOST and SMTP_PORT
- ✅ `backend/services/email_service.py` - Updated to use settings.SMTP_HOST and settings.SMTP_PORT

---

## Summary

1. **Update config.py** with:
   - `SMTP_USER`: Your Outlook email address
   - `SMTP_PASSWORD`: Your regular Outlook password
   - `SMTP_HOST`: `smtp-mail.outlook.com`
   - `SMTP_PORT`: `587`
2. **Test** using the test script above (optional)
3. **Done!** Email verification will work automatically

**✅ No 2FA needed**
**✅ No app password needed**
**✅ No phone number needed**
**✅ Can send to Gmail, Yahoo, any email** - all work!
**✅ No `.env` file needed** - everything is in `config.py`!
