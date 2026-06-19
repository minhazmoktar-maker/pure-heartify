import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "heartify-session-id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Fire-and-forget analytics event. Never throws, never blocks the UI.
 */
export async function track(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("analytics_events").insert({
      user_id: user?.id ?? null,
      event_name: eventName,
      properties: properties as never,
      session_id: getSessionId(),
    });
  } catch (err) {
    // Never break the app over analytics
    if (import.meta.env.DEV) console.warn("[analytics] track failed", eventName, err);
  }
}
