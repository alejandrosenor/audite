import { supabase } from "./supabase";

export async function getAnnualChallengeCalendar(year) {
  const targetYear = Number(year);
  if (!Number.isInteger(targetYear)) throw new Error("Año no válido.");

  const { data, error } = await supabase.rpc(
    "get_annual_challenge_calendar",
    { target_year: targetYear },
  );

  if (error) throw error;
  return data;
}
