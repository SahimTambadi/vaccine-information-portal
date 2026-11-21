
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import vaccines from "../src/data/vaccines.js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Supabase URL or secret key is missing from .env");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function migrateVaccines() {
  try {
    console.log("Starting vaccine migration...");

    // Step 1: Verify the source data
    if (vaccines.length !== 19) {
      throw new Error(
        `Expected 19 vaccines, but found ${vaccines.length}. Migration stopped.`
      );
    }

    const ids = vaccines.map((vaccine) => vaccine.id);

    if (new Set(ids).size !== vaccines.length) {
      throw new Error("Duplicate vaccine IDs found. Migration stopped.");
    }

    // Step 2: Check that the destination table is empty
    const { count, error: checkError } = await supabase
      .from("vaccines")
      .select("*", { count: "exact", head: true });

    if (checkError) throw checkError;

    if (count !== 0) {
      throw new Error(
        `The vaccines table already contains ${count} records. Migration stopped to prevent duplicates.`
      );
    }

    // Step 3: Prepare records without losing nested information
    const records = vaccines.map(
      ({ id, name, category, purpose, age, icon, fullName, ...details }) => ({
        id,
        name,
        category,
        purpose,
        age,
        icon,
        full_name: fullName,
        details,
      })
    );

    // Step 4: Insert all records
    const { data, error } = await supabase
      .from("vaccines")
      .insert(records)
      .select("id");

    if (error) throw error;

    console.log("Migration successful!");
    console.log("Records inserted:", data.length);
    console.log("Vaccine IDs:", data.map((item) => item.id));
  } catch (error) {
    console.error("Migration failed:", error.message);
  }
}

migrateVaccines();
