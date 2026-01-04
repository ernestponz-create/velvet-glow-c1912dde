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
      bookings: {
        Row: {
          consult_preferred_date: string | null
          consult_preferred_time: string | null
          created_at: string
          id: string
          investment_level: string
          market_highest_price: number | null
          notes: string | null
          preferred_date: string
          preferred_time: string | null
          price_paid: number | null
          procedure_name: string
          procedure_slug: string
          provider_id: string
          status: string
          updated_at: string
          user_id: string
          wants_virtual_consult: boolean | null
        }
        Insert: {
          consult_preferred_date?: string | null
          consult_preferred_time?: string | null
          created_at?: string
          id?: string
          investment_level: string
          market_highest_price?: number | null
          notes?: string | null
          preferred_date: string
          preferred_time?: string | null
          price_paid?: number | null
          procedure_name: string
          procedure_slug: string
          provider_id: string
          status?: string
          updated_at?: string
          user_id: string
          wants_virtual_consult?: boolean | null
        }
        Update: {
          consult_preferred_date?: string | null
          consult_preferred_time?: string | null
          created_at?: string
          id?: string
          investment_level?: string
          market_highest_price?: number | null
          notes?: string | null
          preferred_date?: string
          preferred_time?: string | null
          price_paid?: number | null
          procedure_name?: string
          procedure_slug?: string
          provider_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          wants_virtual_consult?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          benefit_phrase: string
          concerns: string[]
          created_at: string
          duration_minutes: number | null
          id: string
          image_url: string | null
          investment_level: string
          is_featured: boolean | null
          name: string
          recovery_days: number | null
          short_description: string
          slug: string
          updated_at: string
        }
        Insert: {
          benefit_phrase: string
          concerns?: string[]
          created_at?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          investment_level: string
          is_featured?: boolean | null
          name: string
          recovery_days?: number | null
          short_description: string
          slug: string
          updated_at?: string
        }
        Update: {
          benefit_phrase?: string
          concerns?: string[]
          created_at?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          investment_level?: string
          is_featured?: boolean | null
          name?: string
          recovery_days?: number | null
          short_description?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          budget_tier: string | null
          created_at: string
          full_name: string | null
          id: string
          location_city: string | null
          main_concerns: string[] | null
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          budget_tier?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_city?: string | null
          main_concerns?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          budget_tier?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_city?: string | null
          main_concerns?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          city: string
          created_at: string
          display_name: string
          id: string
          image_url: string | null
          name: string
          neighborhood: string
          next_available_date: string | null
          next_available_time: string | null
          procedures: string[] | null
          rating: number
          recommendation_reason: string | null
          review_count: number
          specialty: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          city: string
          created_at?: string
          display_name: string
          id?: string
          image_url?: string | null
          name: string
          neighborhood: string
          next_available_date?: string | null
          next_available_time?: string | null
          procedures?: string[] | null
          rating?: number
          recommendation_reason?: string | null
          review_count?: number
          specialty: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          city?: string
          created_at?: string
          display_name?: string
          id?: string
          image_url?: string | null
          name?: string
          neighborhood?: string
          next_available_date?: string | null
          next_available_time?: string | null
          procedures?: string[] | null
          rating?: number
          recommendation_reason?: string | null
          review_count?: number
          specialty?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          booking_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string
          id: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at: string
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
