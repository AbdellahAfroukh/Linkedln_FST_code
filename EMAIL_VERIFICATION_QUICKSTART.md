# Email Verification - Quick Start Guide

## Step 1: Gmail Setup (5 minutes)

1. Go to **myaccount.google.com**
2. Click **Security** in the left menu
3. Find **2-Step Verification** → Click **Enable**
4. Follow the prompts to set up 2FA with your phone
5. After 2FA is enabled, go back to Security
6. Find **App passwords** (near 2-Step Verification)
7. Select **Mail** and **Windows** from the dropdowns
8. Click **Generate**
9. Copy the 16-character password (without spaces)

## Step 2: Create .env File

Create `backend/.env` with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/linkedin_fst
SECRET_KEY=your-very-secure-secret-key-at-least-32-characters-long
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

# Email Configuration
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:5173

# Other settings
OTP_SECRET_KEY=another-secure-key-for-otp-encryption
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SCOPUS_API_KEY=your-scopus-key-if-needed
```

**Replace:**

- `your-gmail@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-char password from Step 1
- `your-very-secure-secret-key...` with a random secure string
- `another-secure-key...` with another random secure string

## Step 3: Database Migration

Add 3 columns to the `user` table:

```sql
ALTER TABLE "user" ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE "user" ADD COLUMN email_verification_token_expiry VARCHAR(255);
```

Or if using SQLAlchemy migrations, run:

```bash
cd backend
python -m alembic upgrade head
```

## Step 4: Test Registration

1. **Start backend**:

   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

2. **Start frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Register a test account**:
   - Go to http://localhost:5173/register
   - Fill in the form
   - Click "Create Account"
   - You should see: "Check your email for a verification link"

4. **Check your Gmail**:
   - Look in your inbox for verification email
   - **If not there**: Check Spam folder
   - If still missing: Backend might not be sending (check logs)

5. **Verify email**:
   - Click the link in the email
   - You should see: "Email verified successfully!"
   - Click "Go to Login"

6. **Try logging in**:
   - Email address you registered
   - Your password
   - Should work now!

## Step 5: Test Resend

To test the resend functionality:

1. Register with a different email
2. **Don't verify** - just wait
3. Go to http://localhost:5173/login
4. Try logging in with the unverified email
5. You should see error: "Email not verified"
6. Click "Resend Verification Email"
7. Check your inbox for new email
8. Verify and try logging in again

## Troubleshooting

### Email Not Arriving

**Check backend logs** for:

- `Failed to send verification email` errors
- SMTP connection issues

**Possible causes**:

1. Gmail password incorrect in `.env`
2. Gmail 2FA not enabled (required for app passwords)
3. App password wasn't generated correctly
4. Firewall blocking SMTP port 587

**Test Gmail SMTP**:

```python
import smtplib
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('your-email@gmail.com', 'your-app-password')
    print("✅ Gmail SMTP works!")
except Exception as e:
    print(f"❌ Gmail SMTP failed: {e}")
```

### Token Invalid Error

- Token must be in URL: `/verify-email?token=abc123`
- Token is case-sensitive
- Token expires after 24 hours
- Each resend generates a NEW token

### Already Registered

If you try to register with same email twice:

- You'll get error: "Email already registered"
- To fix: Go to `/resend-verification` to resend email to that account

### Login Still Blocked After Verification

1. Check database: `SELECT email_verified FROM "user" WHERE email='your@email.com'`
2. Should be `true` (not `false`)
3. If `false`, the verification didn't complete
4. Try resending and verifying again

## Production Deployment

Before going live:

1. **Update FRONTEND_URL**:

   ```
   FRONTEND_URL=https://yourapp.com
   ```

2. **Disable Gmail in .env if you want to use SendGrid/Mailgun**:
   - Create EmailService adapter for your provider
   - Update `send_verification_email()` method

3. **Add rate limiting** to prevent email spam:
   - Max 3 resends per email per hour
   - Max 5 resends per IP per day

4. **SSL/HTTPS required**: Email links won't work on HTTP

5. **Test with real Gmail accounts** to ensure delivery

## Files to Know

- **Backend email logic**: `backend/services/email_service.py`
- **Registration flow**: `backend/services/authentification.py` (register_user method)
- **Endpoints**: `backend/routes/auth_routes.py` (/verify-email, /resend-verification-email)
- **Frontend pages**:
  - `frontend/src/features/auth/pages/verify-email-page.tsx`
  - `frontend/src/features/auth/pages/resend-verification-page.tsx`
- **Configuration**: `backend/config.py` (SMTP settings)
- **Documentation**: `EMAIL_VERIFICATION_IMPLEMENTATION.md`

## Quick Reference

| Action             | URL                                    | Response                      |
| ------------------ | -------------------------------------- | ----------------------------- |
| Register           | POST `/auth/register`                  | 201 + verification email sent |
| Verify Email       | POST `/auth/verify-email`              | 200 + email_verified=true     |
| Resend Email       | POST `/auth/resend-verification-email` | 200 + new email sent          |
| Login (verified)   | POST `/auth/login`                     | 200 + tokens                  |
| Login (unverified) | POST `/auth/login`                     | 403 "Email not verified"      |

## Support

If something doesn't work:

1. Check `backend/logs/` for errors
2. Check browser console (F12) for frontend errors
3. Verify Gmail credentials in `.env`
4. Check database for new User fields
5. Review `EMAIL_VERIFICATION_IMPLEMENTATION.md` for full details
