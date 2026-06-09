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
      api_configurations: {
        Row: {
          api_key_encrypted: string | null
          api_name: string
          api_type: string
          base_url: string
          created_at: string
          created_by: string | null
          id: string
          is_enabled: boolean
          last_checked_at: string | null
          rate_limit_per_minute: number
          status: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          api_name: string
          api_type: string
          base_url: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          last_checked_at?: string | null
          rate_limit_per_minute?: number
          status?: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          api_name?: string
          api_type?: string
          base_url?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_enabled?: boolean
          last_checked_at?: string | null
          rate_limit_per_minute?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      copy_trades: {
        Row: {
          action: string
          amount: number
          created_at: string
          id: string
          leader_address: string
          leader_name: string | null
          price: number
          status: string
          token_address: string
          token_symbol: string
          tx_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          amount?: number
          created_at?: string
          id?: string
          leader_address: string
          leader_name?: string | null
          price?: number
          status?: string
          token_address: string
          token_symbol: string
          tx_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          id?: string
          leader_address?: string
          leader_name?: string | null
          price?: number
          status?: string
          token_address?: string
          token_symbol?: string
          tx_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      disclaimer_acknowledgments: {
        Row: {
          created_at: string
          id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          country: string | null
          created_at: string
          discord: string | null
          experience: string | null
          id: string
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          role_applying: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["partner_application_status"]
          telegram: string | null
          user_id: string | null
          wallet_address: string | null
          why_join: string | null
          x_profile: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          discord?: string | null
          experience?: string | null
          id?: string
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_applying: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["partner_application_status"]
          telegram?: string | null
          user_id?: string | null
          wallet_address?: string | null
          why_join?: string | null
          x_profile?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          discord?: string | null
          experience?: string | null
          id?: string
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_applying?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["partner_application_status"]
          telegram?: string | null
          user_id?: string | null
          wallet_address?: string | null
          why_join?: string | null
          x_profile?: string | null
        }
        Relationships: []
      }
      partner_commission_settings: {
        Row: {
          campaign_pct: number
          contribution_weight: number
          growth_pool_pct: number
          id: string
          launch_fee_pct: number
          premium_pct: number
          promotion_pct: number
          revenue_weight: number
          trading_fee_pct: number
          updated_at: string
        }
        Insert: {
          campaign_pct?: number
          contribution_weight?: number
          growth_pool_pct?: number
          id?: string
          launch_fee_pct?: number
          premium_pct?: number
          promotion_pct?: number
          revenue_weight?: number
          trading_fee_pct?: number
          updated_at?: string
        }
        Update: {
          campaign_pct?: number
          contribution_weight?: number
          growth_pool_pct?: number
          id?: string
          launch_fee_pct?: number
          premium_pct?: number
          promotion_pct?: number
          revenue_weight?: number
          trading_fee_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      partner_contributions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          partner_id: string
          points: number
          source_id: string | null
          status: Database["public"]["Enums"]["partner_contribution_status"]
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id: string
          points?: number
          source_id?: string | null
          status?: Database["public"]["Enums"]["partner_contribution_status"]
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id?: string
          points?: number
          source_id?: string | null
          status?: Database["public"]["Enums"]["partner_contribution_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_contributions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_profiles: {
        Row: {
          bio: string | null
          contribution_score: number
          created_at: string
          discord: string | null
          id: string
          is_active: boolean
          level: number
          paid_total: number
          partner_role: Database["public"]["Enums"]["app_role"]
          pending_payout: number
          referral_code: string
          revenue_score: number
          telegram: string | null
          tier: string
          total_earnings: number
          updated_at: string
          user_id: string
          wallet_address: string | null
          x_profile: string | null
          xp: number
        }
        Insert: {
          bio?: string | null
          contribution_score?: number
          created_at?: string
          discord?: string | null
          id?: string
          is_active?: boolean
          level?: number
          paid_total?: number
          partner_role: Database["public"]["Enums"]["app_role"]
          pending_payout?: number
          referral_code: string
          revenue_score?: number
          telegram?: string | null
          tier?: string
          total_earnings?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          x_profile?: string | null
          xp?: number
        }
        Update: {
          bio?: string | null
          contribution_score?: number
          created_at?: string
          discord?: string | null
          id?: string
          is_active?: boolean
          level?: number
          paid_total?: number
          partner_role?: Database["public"]["Enums"]["app_role"]
          pending_payout?: number
          referral_code?: string
          revenue_score?: number
          telegram?: string | null
          tier?: string
          total_earnings?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          x_profile?: string | null
          xp?: number
        }
        Relationships: []
      }
      partner_revenue: {
        Row: {
          amount: number
          commission_amount: number
          commission_percent: number
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          partner_id: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          partner_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          partner_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_revenue_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          amount: number
          chain: string
          closed_at: string | null
          created_at: string
          current_price: number
          current_value: number
          entry_price: number
          entry_value: number
          exit_price: number | null
          exit_reason: string | null
          exit_tx_id: string | null
          id: string
          profit_loss_percent: number
          profit_loss_value: number
          profit_take_percent: number
          status: string
          stop_loss_percent: number
          token_address: string
          token_name: string | null
          token_symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          chain?: string
          closed_at?: string | null
          created_at?: string
          current_price?: number
          current_value?: number
          entry_price?: number
          entry_value?: number
          exit_price?: number | null
          exit_reason?: string | null
          exit_tx_id?: string | null
          id?: string
          profit_loss_percent?: number
          profit_loss_value?: number
          profit_take_percent?: number
          status?: string
          stop_loss_percent?: number
          token_address: string
          token_name?: string | null
          token_symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          chain?: string
          closed_at?: string | null
          created_at?: string
          current_price?: number
          current_value?: number
          entry_price?: number
          entry_value?: number
          exit_price?: number | null
          exit_reason?: string | null
          exit_tx_id?: string | null
          id?: string
          profit_loss_percent?: number
          profit_loss_value?: number
          profit_take_percent?: number
          status?: string
          stop_loss_percent?: number
          token_address?: string
          token_name?: string | null
          token_symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sniper_settings: {
        Row: {
          category_filters: string[]
          created_at: string
          id: string
          max_concurrent_trades: number
          min_liquidity: number
          priority: string
          profit_take_percentage: number
          stop_loss_percentage: number
          token_blacklist: string[]
          token_whitelist: string[]
          trade_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_filters?: string[]
          created_at?: string
          id?: string
          max_concurrent_trades?: number
          min_liquidity?: number
          priority?: string
          profit_take_percentage?: number
          stop_loss_percentage?: number
          token_blacklist?: string[]
          token_whitelist?: string[]
          trade_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_filters?: string[]
          created_at?: string
          id?: string
          max_concurrent_trades?: number
          min_liquidity?: number
          priority?: string
          profit_take_percentage?: number
          stop_loss_percentage?: number
          token_blacklist?: string[]
          token_whitelist?: string[]
          trade_amount?: number
          updated_at?: string
          user_id?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "user"
        | "ambassador"
        | "dev_consultant"
        | "growth_partner"
        | "strategic_partner"
        | "admin"
        | "super_admin"
      partner_application_status: "pending" | "approved" | "rejected"
      partner_contribution_status: "pending" | "approved" | "rejected"
      partner_payout_status: "pending" | "approved" | "rejected" | "paid"
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
      app_role: [
        "user",
        "ambassador",
        "dev_consultant",
        "growth_partner",
        "strategic_partner",
        "admin",
        "super_admin",
      ],
      partner_application_status: ["pending", "approved", "rejected"],
      partner_contribution_status: ["pending", "approved", "rejected"],
      partner_payout_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
