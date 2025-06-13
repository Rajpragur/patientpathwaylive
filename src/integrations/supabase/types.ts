export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      automation_webhooks: {
        Row: {
          active: boolean | null
          created_at: string | null
          doctor_id: string
          id: string
          updated_at: string | null
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          doctor_id: string
          id?: string
          updated_at?: string | null
          webhook_type?: string
          webhook_url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          updated_at?: string | null
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: []
      }
      custom_quizzes: {
        Row: {
          category: string
          created_at: string
          cta_text: string | null
          cta_type: string | null
          description: string
          doctor_id: string
          id: string
          instructions: string | null
          is_active: boolean | null
          max_score: number
          questions: Json
          scoring: Json
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          cta_text?: string | null
          cta_type?: string | null
          description: string
          doctor_id: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          max_score?: number
          questions?: Json
          scoring?: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          cta_text?: string | null
          cta_type?: string | null
          description?: string
          doctor_id?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          max_score?: number
          questions?: Json
          scoring?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_quizzes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_notifications: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_notifications_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          avatar_url: string | null
          clinic_name: string | null
          created_at: string
          doctor_id: string | null
          email: string | null
          email_settings: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          specialty: string | null
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          twilio_phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string | null
          email_settings?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          specialty?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string | null
          email_settings?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          specialty?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_domains: {
        Row: {
          created_at: string | null
          doctor_id: string
          domain: string
          id: string
          landing_page_url: string | null
          updated_at: string | null
          verification_token: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          domain: string
          id?: string
          landing_page_url?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          domain?: string
          id?: string
          landing_page_url?: string | null
          updated_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      lead_communications: {
        Row: {
          communication_type: string
          id: string
          lead_id: string
          message: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          communication_type: string
          id?: string
          lead_id: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          communication_type?: string
          id?: string
          lead_id?: string
          message?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quiz_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_incidents: {
        Row: {
          created_at: string | null
          description: string | null
          doctor_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          doctor_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          doctor_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_incidents_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          answers: Json | null
          created_at: string
          custom_quiz_id: string | null
          doctor_id: string
          email: string | null
          id: string
          incident_source: string | null
          lead_source: string | null
          lead_status: string | null
          name: string
          phone: string | null
          quiz_type: string
          scheduled_date: string | null
          score: number
          share_key: string | null
          submitted_at: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          custom_quiz_id?: string | null
          doctor_id: string
          email?: string | null
          id?: string
          incident_source?: string | null
          lead_source?: string | null
          lead_status?: string | null
          name: string
          phone?: string | null
          quiz_type: string
          scheduled_date?: string | null
          score: number
          share_key?: string | null
          submitted_at?: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          custom_quiz_id?: string | null
          doctor_id?: string
          email?: string | null
          id?: string
          incident_source?: string | null
          lead_source?: string | null
          lead_status?: string | null
          name?: string
          phone?: string | null
          quiz_type?: string
          scheduled_date?: string | null
          score?: number
          share_key?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_leads_custom_quiz_id_fkey"
            columns: ["custom_quiz_id"]
            isOneToOne: false
            referencedRelation: "custom_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_leads_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          connected: boolean | null
          created_at: string | null
          doctor_id: string
          id: string
          platform: string
          refresh_token: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          access_token?: string | null
          connected?: boolean | null
          created_at?: string | null
          doctor_id: string
          id?: string
          platform: string
          refresh_token?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          access_token?: string | null
          connected?: boolean | null
          created_at?: string | null
          doctor_id?: string
          id?: string
          platform?: string
          refresh_token?: string | null
          updated_at?: string | null
          username?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
