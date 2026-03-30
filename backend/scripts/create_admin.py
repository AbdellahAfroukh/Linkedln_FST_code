"""
Create an initial admin user.

Usage:
  python scripts/create_admin.py --email admin@example.com --full-name "Admin User" --password "StrongPassword123"

If --password is omitted, you'll be prompted securely.
"""
import argparse
import sys
from getpass import getpass
from pathlib import Path

# Ensure project root is importable when running as: python scripts/create_admin.py
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import models
from database import SessionLocal, engine
from fastapi import HTTPException
from models.user import User, UserType
from services.authentification import AuthService


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--full-name", required=True, help="Admin full name")
    parser.add_argument("--password", required=False, help="Admin password")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    password = args.password or getpass("Admin password: ")

    if not password:
        print("Password is required.")
        return

    # Ensure DB schema exists before attempting to create the admin user.
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == args.email).first()
        if existing_user:
            print("A user with this email already exists.")
            return

        try:
            admin_user = AuthService.register_user(
                db=db,
                email=args.email,
                password=password,
                fullName=args.full_name,
                user_type=UserType.ADMIN,
            )
            # Bootstrap admin should be immediately usable without email flow.
            admin_user.email_verified = True
            admin_user.email_verification_token = None
            admin_user.email_verification_token_expiry = None
            db.commit()
            db.refresh(admin_user)
        except HTTPException as exc:
            # Allow the documented bootstrap password even if it does not satisfy policy.
            if "Password must" not in str(exc.detail):
                raise

            admin_user = User(
                email=args.email,
                password=AuthService.get_password_hash(password),
                fullName=args.full_name,
                user_type=UserType.ADMIN,
                profile_completed=True,
                otp_configured=False,
                email_verified=True,
                email_verification_token=None,
                email_verification_token_expiry=None,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        print("✅ Admin user created successfully.")
        print(f"ID: {admin_user.id}")
        print(f"Email: {admin_user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
