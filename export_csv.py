"""
Export all tables from khojsetu.db into individual CSV files.
Run: python export_csv.py
"""
import csv
import sqlite3
from pathlib import Path

DB_PATH = Path("database/khojsetu.db")
OUT_DIR = Path("exports")
OUT_DIR.mkdir(exist_ok=True)

TABLES = ["users", "reports", "claims", "notifications"]

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

for table in TABLES:
    rows = conn.execute(f"SELECT * FROM {table} ORDER BY rowid").fetchall()
    out_file = OUT_DIR / f"{table}.csv"
    with open(out_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if rows:
            writer.writerow(rows[0].keys())  # header
            for row in rows:
                writer.writerow(row)
    print(f"Exported {len(rows)} rows -> {out_file}")

conn.close()
print("Done. Open the .csv files in the exports/ folder with Excel, Google Sheets, or any text editor.")
