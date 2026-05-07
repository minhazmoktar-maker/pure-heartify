import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cleanup: Array<() => void> = [];
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const perm = await PushNotifications.checkPermissions();
        let granted = perm.receive === "granted";
        if (!granted) {
          const req = await PushNotifications.requestPermissions();
          granted = req.receive === "granted";
        }
        if (!granted) return;

        await PushNotifications.register();

        const r1 = await PushNotifications.addListener("registration", async (t) => {
          await (supabase.from as any)("device_tokens").upsert(
            {
              user_id: user.id,
              token: t.value,
              platform: Capacitor.getPlatform(),
            },
            { onConflict: "user_id,token" }
          );
        });
        const r2 = await PushNotifications.addListener("registrationError", (e) =>
          console.warn("Push registration error", e)
        );
        cleanup = [() => r1.remove(), () => r2.remove()];
      } catch {
        /* not native */
      }
    })();
    return () => cleanup.forEach((fn) => fn());
  }, [user]);
}
