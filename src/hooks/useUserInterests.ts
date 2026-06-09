import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserInterests {
  primary_interest: string | null;
  secondary_interest: string | null;
  exploration_interest: string | null;
}

export function useUserInterests() {
  const { user } = useAuth();
  return useQuery<UserInterests | null>({
    queryKey: ["user-interests", user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_interests")
        .select("primary_interest, secondary_interest, exploration_interest")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
