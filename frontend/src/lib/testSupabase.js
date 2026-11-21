
import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from("vaccines")
    .select("*");

  if (error) {
    console.error("Supabase connection failed:", error.message);
    return;
  }

  console.log("Supabase connection successful!");
  console.log("Vaccine records:", data);
}
