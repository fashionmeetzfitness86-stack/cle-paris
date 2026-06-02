import supabase, { isSupabaseConfigured } from "../../lib/supabase";

export interface ActivityEntry {
  id: string;
  admin_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

/** Fire-and-forget activity log write. Never throws. */
export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;
    await supabase.from("activity_log").insert({
      admin_user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // Non-critical — never surface activity log failures
  }
}

/** Fetch the most recent activity entries for the dashboard. */
export async function listActivity(limit = 20): Promise<ActivityEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ActivityEntry[]) ?? [];
}
