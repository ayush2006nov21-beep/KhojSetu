import sqlite3
from pathlib import Path

# Find the project folder and database automatically.
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "khojsetu.db"
UPLOAD_DIR = BASE_DIR / "static" / "uploads"

if not DB_PATH.exists():
    print("Database not found:", DB_PATH)
    raise SystemExit(1)

confirm = input(
    "This will permanently delete ALL reports, claims, notifications, "
    "users, login credentials, and uploaded photos. Type DELETE ALL to continue: "
)

if confirm != "DELETE ALL":
    print("Cancelled. No data was deleted.")
    raise SystemExit(0)

try:
    with sqlite3.connect(DB_PATH) as db:
        db.execute("PRAGMA foreign_keys = ON")

        # Delete dependent records before parent records.
        tables_to_clear = [
            "notifications",
            "claims",
            "reports",
            "users",
        ]

        existing_tables = {
            row[0] for row in db.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }

        for table in tables_to_clear:
            if table in existing_tables:
                db.execute(f'DELETE FROM "{table}"')
                print(f"Cleared {table}")

        # Reset auto-increment counters where SQLite uses them.
        if "sqlite_sequence" in existing_tables:
            for table in tables_to_clear:
                db.execute(
                    "DELETE FROM sqlite_sequence WHERE name = ?",
                    (table,)
                )

        db.commit()

    # Delete uploaded item images, but keep the uploads folder.
    deleted_files = 0
    if UPLOAD_DIR.exists():
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file():
                file_path.unlink()
                deleted_files += 1

    print("\nKhojSetu has been reset successfully.")
    print("Deleted uploaded files:", deleted_files)
    print("All user and admin login credentials have been deleted.")
    print("Register new accounts to use the website again.")

except Exception as error:
    print("\nReset failed:", error)
    print("Restore your database backup if necessary.")
