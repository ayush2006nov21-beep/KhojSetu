import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "khojsetu.db"

if not DB_PATH.exists():
    print("Database not found:", DB_PATH)
    raise SystemExit(1)

email = input("Enter the email of the account to make admin: ").strip().lower()

if not email or "@" not in email:
    print("Please enter a valid email address.")
    raise SystemExit(1)

try:
    with sqlite3.connect(DB_PATH) as db:
        db.row_factory = sqlite3.Row

        columns = {
            row["name"] for row in db.execute("PRAGMA table_info(users)")
        }

        if not {"email", "is_admin"}.issubset(columns):
            print("The users table must contain email and is_admin columns.")
            print("Found columns:", ", ".join(sorted(columns)))
            raise SystemExit(1)

        user = db.execute(
            "SELECT id, email FROM users WHERE lower(email) = ?",
            (email,)
        ).fetchone()

        if user is None:
            print("No account found with that email.")
            print("Register that account on the website first, then run this script again.")
            raise SystemExit(1)

        db.execute(
            "UPDATE users SET is_admin = 1 WHERE id = ?",
            (user["id"],)
        )
        db.commit()

        print(f"\nSuccess! {user['email']} is now an admin.")
        print("Log out of the website and log back in for the change to take effect.")

except sqlite3.Error as error:
    print("Database error:", error)
