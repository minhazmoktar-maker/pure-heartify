import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DoseVideo {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  section_id: string | null;
  halal_score: number | null;
  category: string | null;
}

export interface DailyDoseData {
  dose: {
    id: string;
    dose_date: string;
    video_ids: string[];
    total_minutes: number;
    completed_count: number;
    completed_at: string | null;
  };
  videos: DoseVideo[];
  completedVideoIds: string[];
  streak: {
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
    total_doses_completed: number;
  };
}

export function useDailyDose() {
  const { user } = useAuth();

  return useQuery<DailyDoseData>({
    queryKey: ["daily-dose", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-daily-dose", { body: {} });
      if (error) throw new Error(error.message);
      return data as DailyDoseData;
    },
  });
}

export interface CompleteResult {
  ok: boolean;
  inDose: boolean;
  completedCount?: number;
  total?: number;
  justCompleted?: boolean;
  milestone?: number | null;
  streak?: any;
}

export function useCompleteDoseVideo() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation<CompleteResult, Error, string>({
    mutationFn: async (videoId: string) => {
      const { data, error } = await supabase.functions.invoke("complete-dose-video", {
        body: { videoId },
      });
      if (error) throw new Error(error.message);
      return data as CompleteResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-dose", user?.id] });
    },
  });
}
