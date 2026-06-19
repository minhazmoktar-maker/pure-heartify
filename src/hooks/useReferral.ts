import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function generateCode(): string {
  // 8-char readable code
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function useReferral() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: existing } = await supabase
      .from("referrals")
      .select("code,status")
      .eq("inviter_id", user.id);

    let myCode = existing?.find((r) => r.status === "pending" && !!r.code)?.code ?? null;
    if (!myCode) {
      const newCode = generateCode();
      const { data: inserted, error } = await supabase
        .from("referrals")
        .insert({ inviter_id: user.id, code: newCode, status: "pending" })
        .select("code")
        .single();
      if (!error && inserted) myCode = inserted.code;
    }
    setCode(myCode);
    setRedeemedCount(existing?.filter((r) => r.status === "redeemed").length ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const shareUrl = code
    ? `${window.location.origin}/signup?ref=${code}`
    : null;

  const copy = useCallback(async () => {
    if (!shareUrl) return false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  }, [shareUrl]);

  return { code, shareUrl, redeemedCount, loading, copy, refresh: load };
}
