export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      channels_state: {
        Row: {
          category: string | null
          channel_id: string | null
          channel_name: string
          created_at: string
          id: string
          last_pulled_at: string | null
          next_page_token: string | null
          resolved_at: string | null
          total_pulled: number
          updated_at: string
          uploads_playlist_id: string | null
        }
        Insert: {
          category?: string | null
          channel_id?: string | null
          channel_name: string
          created_at?: string
          id?: string
          last_pulled_at?: string | null
          next_page_token?: string | null
          resolved_at?: string | null
          total_pulled?: number
          updated_at?: string
          uploads_playlist_id?: string | null
        }
        Update: {
          category?: string | null
          channel_id?: string | null
          channel_name?: string
          created_at?: string
          id?: string
          last_pulled_at?: string | null
          next_page_token?: string | null
          resolved_at?: string | null
          total_pulled?: number
          updated_at?: string
          uploads_playlist_id?: string | null
        }
        Relationships: []
      }
      curated_videos: {
        Row: {
          category: string
          channel_title: string
          halal_score: number
          id: string
          ingested_at: string
          is_trusted_channel: boolean
          published_at: string | null
          section_id: string | null
          thumbnail_url: string
          title: string
          video_id: string
          view_count: number
        }
        Insert: {
          category?: string
          channel_title: string
          halal_score?: number
          id?: string
          ingested_at?: string
          is_trusted_channel?: boolean
          published_at?: string | null
          section_id?: string | null
          thumbnail_url?: string
          title: string
          video_id: string
          view_count?: number
        }
        Update: {
          category?: string
          channel_title?: string
          halal_score?: number
          id?: string
          ingested_at?: string
          is_trusted_channel?: boolean
          published_at?: string | null
          section_id?: string | null
          thumbnail_url?: string
          title?: string
          video_id?: string
          view_count?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          channel_title: string | null
          created_at: string
          id: string
          thumbnail_url: string | null
          user_id: string
          video_id: string
          video_title: string | null
        }
        Insert: {
          channel_title?: string | null
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          user_id: string
          video_id: string
          video_title?: string | null
        }
        Update: {
          channel_title?: string | null
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          user_id?: string
          video_id?: string
          video_title?: string | null
        }
        Relationships: []
      }
      ingestion_log: {
        Row: {
          created_at: string
          id: string
          query: string
          quota_used: number
          section_id: string | null
          videos_added: number
          videos_found: number
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          quota_used?: number
          section_id?: string | null
          videos_added?: number
          videos_found?: number
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          quota_used?: number
          section_id?: string | null
          videos_added?: number
          videos_found?: number
        }
        Relationships: []
      }
      moderation_log: {
        Row: {
          channel_title: string
          created_at: string
          halal_score: number | null
          id: string
          matched_rule: string | null
          reject_reason: string
          source: string | null
          thumbnail_url: string | null
          title: string
          video_id: string
        }
        Insert: {
          channel_title: string
          created_at?: string
          halal_score?: number | null
          id?: string
          matched_rule?: string | null
          reject_reason: string
          source?: string | null
          thumbnail_url?: string | null
          title: string
          video_id: string
        }
        Update: {
          channel_title?: string
          created_at?: string
          halal_score?: number | null
          id?: string
          matched_rule?: string | null
          reject_reason?: string
          source?: string | null
          thumbnail_url?: string | null
          title?: string
          video_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          id: string
          thumbnail_url: string | null
          user_id: string
          video_id: string
          video_title: string | null
          watched_at: string
        }
        Insert: {
          id?: string
          thumbnail_url?: string | null
          user_id: string
          video_id: string
          video_title?: string | null
          watched_at?: string
        }
        Update: {
          id?: string
          thumbnail_url?: string | null
          user_id?: string
          video_id?: string
          video_title?: string | null
          watched_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
