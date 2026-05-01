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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      behavioral_baselines: {
        Row: {
          accessibility_mode: boolean
          avg_pointer_velocity: number | null
          avg_typing_interval_ms: number | null
          common_hours: number[] | null
          created_at: string
          known_devices: string[] | null
          known_locations: string[] | null
          last_updated: string
          samples_count: number
          std_pointer_velocity: number | null
          std_typing_interval_ms: number | null
          user_id: string
        }
        Insert: {
          accessibility_mode?: boolean
          avg_pointer_velocity?: number | null
          avg_typing_interval_ms?: number | null
          common_hours?: number[] | null
          created_at?: string
          known_devices?: string[] | null
          known_locations?: string[] | null
          last_updated?: string
          samples_count?: number
          std_pointer_velocity?: number | null
          std_typing_interval_ms?: number | null
          user_id: string
        }
        Update: {
          accessibility_mode?: boolean
          avg_pointer_velocity?: number | null
          avg_typing_interval_ms?: number | null
          common_hours?: number[] | null
          created_at?: string
          known_devices?: string[] | null
          known_locations?: string[] | null
          last_updated?: string
          samples_count?: number
          std_pointer_velocity?: number | null
          std_typing_interval_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_signals: {
        Row: {
          avg_pointer_velocity: number | null
          avg_typing_interval_ms: number | null
          context: string | null
          created_at: string
          device_fp: string | null
          hour_of_day: number | null
          id: string
          location_hint: string | null
          user_id: string
        }
        Insert: {
          avg_pointer_velocity?: number | null
          avg_typing_interval_ms?: number | null
          context?: string | null
          created_at?: string
          device_fp?: string | null
          hour_of_day?: number | null
          id?: string
          location_hint?: string | null
          user_id: string
        }
        Update: {
          avg_pointer_velocity?: number | null
          avg_typing_interval_ms?: number | null
          context?: string | null
          created_at?: string
          device_fp?: string | null
          hour_of_day?: number | null
          id?: string
          location_hint?: string | null
          user_id?: string
        }
        Relationships: []
      }
      failed_tx_attempts: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          last_attempt_at: string
          locked_until: string | null
          user_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
          user_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          transaction_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          resolved?: boolean
          resolved_at?: string | null
          severity: string
          transaction_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          reference_number: string
          report_type: string
          reporter_email: string
          reporter_name: string
          reporter_phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          reference_number: string
          report_type: string
          reporter_email: string
          reporter_name: string
          reporter_phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          reference_number?: string
          report_type?: string
          reporter_email?: string
          reporter_name?: string
          reporter_phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          account_number?: string
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          account_number?: string
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      risk_disputes: {
        Row: {
          created_at: string
          dispute_type: string
          id: string
          message: string | null
          resolved_at: string | null
          risk_event_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_type: string
          id?: string
          message?: string | null
          resolved_at?: string | null
          risk_event_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_type?: string
          id?: string
          message?: string | null
          resolved_at?: string | null
          risk_event_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_disputes_risk_event_id_fkey"
            columns: ["risk_event_id"]
            isOneToOne: false
            referencedRelation: "risk_events"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_events: {
        Row: {
          cold_start: boolean
          created_at: string
          decision: string
          id: string
          reason_codes: string[] | null
          risk_score: number
          step_up_method: string | null
          step_up_passed: boolean | null
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          cold_start?: boolean
          created_at?: string
          decision: string
          id?: string
          reason_codes?: string[] | null
          risk_score: number
          step_up_method?: string | null
          step_up_passed?: boolean | null
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          cold_start?: boolean
          created_at?: string
          decision?: string
          id?: string
          reason_codes?: string[] | null
          risk_score?: number
          step_up_method?: string | null
          step_up_passed?: boolean | null
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      step_up_otps: {
        Row: {
          attempts: number
          consumed: boolean
          created_at: string
          expires_at: string
          id: string
          otp_hash: string
          user_id: string
        }
        Insert: {
          attempts?: number
          consumed?: boolean
          created_at?: string
          expires_at: string
          id?: string
          otp_hash: string
          user_id: string
        }
        Update: {
          attempts?: number
          consumed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          otp_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          device: string | null
          id: string
          location: string | null
          risk_score: number
          status: string
          transaction_ref: string
          type: string
          user_name: string
          user_phone: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          device?: string | null
          id?: string
          location?: string | null
          risk_score?: number
          status?: string
          transaction_ref: string
          type: string
          user_name: string
          user_phone?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          device?: string | null
          id?: string
          location?: string | null
          risk_score?: number
          status?: string
          transaction_ref?: string
          type?: string
          user_name?: string
          user_phone?: string | null
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string
          id: string
          pin_hash: string | null
          updated_at: string
          user_id: string
          webauthn_credential_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pin_hash?: string | null
          updated_at?: string
          user_id: string
          webauthn_credential_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pin_hash?: string | null
          updated_at?: string
          user_id?: string
          webauthn_credential_id?: string | null
        }
        Relationships: []
      }
      user_risk_prefs: {
        Row: {
          accessibility_mode: boolean
          behavioral_monitoring_enabled: boolean
          created_at: string
          preferred_step_up: string
          share_signals_for_global_model: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_mode?: boolean
          behavioral_monitoring_enabled?: boolean
          created_at?: string
          preferred_step_up?: string
          share_signals_for_global_model?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_mode?: boolean
          behavioral_monitoring_enabled?: boolean
          created_at?: string
          preferred_step_up?: string
          share_signals_for_global_model?: boolean
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
