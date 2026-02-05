"""
Create an initial admin user.

Usage:
  python scripts/create_admin.py --email admin@example.com --full-name "Admin User" --password "StrongPassword123"

If --password is omitted, you'll be prompted securely.
"""
import argparse
from getpass import getpass

from database import SessionLocal
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

    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == args.email).first()
        if existing_user:
            print("A user with this email already exists.")
            return

        admin_user = AuthService.register_user(
            db=db,
            email=args.email,
            password=password,
            fullName=args.full_name,
            user_type=UserType.ADMIN,
        )

        print("✅ Admin user created successfully.")
        print(f"ID: {admin_user.id}")
        print(f"Email: {admin_user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
