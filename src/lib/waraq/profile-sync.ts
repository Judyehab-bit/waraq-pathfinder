import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "./store";

/**
 * Saves the onboarding form values to the database.
 * Associates the row with the signed-in user when a session exists.
 */
export async function saveProfileToCloud(profile: Profile) {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id ?? null;

  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    full_name: profile.name,
    age: profile.age,
    city: profile.city,
    area: profile.area?.trim() ? profile.area.trim() : null,
    geo_lat: profile.geo?.lat ?? null,
    geo_lng: profile.geo?.lng ?? null,
  });

  if (error) throw error;
}
