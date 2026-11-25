
import os
import pandas as pd
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

CSV_FILE = "vaccine/csv/who_vaccine_products_clean.csv"
TABLE_NAME = "who_vaccine_products_staging"
BATCH_SIZE = 100

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing.")

df = pd.read_csv(CSV_FILE)


def clean_value(column, value):
    # Convert missing CSV values to SQL NULL
    if pd.isna(value):
        return None

    # Supabase column dosage_number is INTEGER
    if column == "dosage_number":
        return int(float(value))

    # Convert NumPy values to normal Python values
    if hasattr(value, "item"):
        return value.item()

    return value


records = [
    {
        column: clean_value(column, value)
        for column, value in row.items()
    }
    for row in df.to_dict(orient="records")
]

print("Total CSV records:", len(records))
print("Dosage number example:", records[0]["dosage_number"])

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

uploaded = 0

for start in range(0, len(records), BATCH_SIZE):
    batch = records[start:start + BATCH_SIZE]

    try:
        response = (
            supabase
            .table(TABLE_NAME)
            .insert(batch)
            .execute()
        )

        uploaded += len(response.data)
        print(f"Uploaded: {uploaded}/{len(records)}")

    except Exception as error:
        print(f"\nUPLOAD FAILED at batch starting row {start + 1}")
        print("Records uploaded before failure:", uploaded)
        print("Error:", error)
        raise

print("\nWHO CSV UPLOAD COMPLETED")
print("Total uploaded:", uploaded)
