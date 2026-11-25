
import pandas as pd
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent

INPUT_FILE = BASE_DIR / "CSV UTF-8.xlsx"
OUTPUT_FILE = BASE_DIR / "who_vaccine_products_clean.csv"

SOURCE_NAME = "WHO MI4A Vaccine Products List (2025)"
SOURCE_URL = (
    "https://cdn.who.int/media/docs/default-source/"
    "immunization/mi4a/"
    "who-mi4a-full-product-list-january2026.xlsx"
)

def normalize_column(value):
    return re.sub(r"[^a-z0-9]", "", str(value).lower())

def clean_text(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if not value or value.lower() in {
        "unknown", "nan", "none", "n/a"
    }:
        return None

    return value

def clean_boolean(value):
    value = clean_text(value)

    if value is None:
        return None

    if value.lower() == "yes":
        return True

    if value.lower() == "no":
        return False

    return None

def clean_integer(value):
    if pd.isna(value):
        return None

    try:
        number = float(str(value).replace(",", "").strip())
        return int(number) if number.is_integer() else None
    except (ValueError, TypeError):
        return None

# Read workbook
if not INPUT_FILE.exists():
    raise FileNotFoundError(INPUT_FILE)

df = pd.read_excel(INPUT_FILE, dtype=object)

# Match actual WHO column names
column_lookup = {
    normalize_column(col): col
    for col in df.columns
}

aliases = {
    "vaccine": ["vaccine"],
    "who_pq": ["whopq"],
    "manufacturer": ["manufacturer"],
    "dosage_number": ["dosagenumber"],
    "commercial_name": [
        "commercialname",
        "commercialnamewhereavailable",
        "brandname"
    ],
}

selected = {}

for field, names in aliases.items():
    for name in names:
        if name in column_lookup:
            selected[field] = column_lookup[name]
            break

missing = set(aliases) - set(selected)

if missing:
    print("Available columns:", list(df.columns))
    raise ValueError(f"Missing columns: {sorted(missing)}")

# Prepare records
records = []

for _, row in df.iterrows():
    vaccine = clean_text(row[selected["vaccine"]])
    manufacturer = clean_text(row[selected["manufacturer"]])

    if not vaccine or not manufacturer:
        continue

    records.append({
        "vaccine_type": vaccine,
        "manufacturer": manufacturer,
        "who_prequalified": clean_boolean(
            row[selected["who_pq"]]
        ),
        "dosage_number": clean_integer(
            row[selected["dosage_number"]]
        ),
        "brand_name": clean_text(
            row[selected["commercial_name"]]
        ),
        "source_name": SOURCE_NAME,
        "source_url": SOURCE_URL,
        "review_status": "pending",
    })

result = pd.DataFrame(records)

before = len(result)

result = result.drop_duplicates(
    subset=[
        "vaccine_type",
        "manufacturer",
        "who_prequalified",
        "dosage_number",
        "brand_name",
    ]
)

result.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig"
)

print("\nWHO DATASET PREPARATION COMPLETED")
print("-----------------------------------")
print("Original Excel rows:", len(df))
print("Valid product records:", len(result))
print("Duplicates removed:", before - len(result))
print("Rows skipped:", len(df) - len(records))
print("Output:", OUTPUT_FILE)

print("\nFirst five records:")
print(result.head().to_string(index=False))
