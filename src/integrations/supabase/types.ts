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
      availability_slots: {
        Row: {
          block_note: string | null
          block_reason: string | null
          booking_id: string | null
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean | null
          provider_id: string
          recurrence_pattern: Json | null
          resource_id: string | null
          slot_type: string
          staff_member_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          block_note?: string | null
          block_reason?: string | null
          booking_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          provider_id: string
          recurrence_pattern?: Json | null
          resource_id?: string | null
          slot_type?: string
          staff_member_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          block_note?: string | null
          block_reason?: string | null
          booking_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          provider_id?: string
          recurrence_pattern?: Json | null
          resource_id?: string | null
          slot_type?: string
          staff_member_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
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
          resource_id: string | null
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
          resource_id?: string | null
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
          resource_id?: string | null
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
          {
            foreignKeyName: "bookings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
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
      member_benefits: {
        Row: {
          created_at: string
          description: string | null
          event_access_level: string
          id: string
          product_discount_percent: number
          spend_threshold: number
          tier: Database["public"]["Enums"]["membership_tier"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_access_level?: string
          id?: string
          product_discount_percent?: number
          spend_threshold?: number
          tier: Database["public"]["Enums"]["membership_tier"]
        }
        Update: {
          created_at?: string
          description?: string | null
          event_access_level?: string
          id?: string
          product_discount_percent?: number
          spend_threshold?: number
          tier?: Database["public"]["Enums"]["membership_tier"]
        }
        Relationships: []
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
          computed_tier: Database["public"]["Enums"]["membership_tier"] | null
          created_at: string
          full_name: string | null
          id: string
          location_city: string | null
          main_concerns: string[] | null
          onboarding_completed: boolean | null
          phone: string | null
          total_spend: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          budget_tier?: string | null
          computed_tier?: Database["public"]["Enums"]["membership_tier"] | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_city?: string | null
          main_concerns?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          total_spend?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          budget_tier?: string | null
          computed_tier?: Database["public"]["Enums"]["membership_tier"] | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_city?: string | null
          main_concerns?: string[] | null
          onboarding_completed?: boolean | null
          phone?: string | null
          total_spend?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          address: string
          approved_at: string | null
          bio: string | null
          city: string
          clinic_name: string
          created_at: string
          credentials: string | null
          id: string
          phone: string
          practice_type: string
          primary_specialty: string
          profile_photo_url: string | null
          rejection_reason: string | null
          secondary_specialties: string[] | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
          years_in_practice: string | null
        }
        Insert: {
          address: string
          approved_at?: string | null
          bio?: string | null
          city: string
          clinic_name: string
          created_at?: string
          credentials?: string | null
          id?: string
          phone: string
          practice_type: string
          primary_specialty: string
          profile_photo_url?: string | null
          rejection_reason?: string | null
          secondary_specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
          years_in_practice?: string | null
        }
        Update: {
          address?: string
          approved_at?: string | null
          bio?: string | null
          city?: string
          clinic_name?: string
          created_at?: string
          credentials?: string | null
          id?: string
          phone?: string
          practice_type?: string
          primary_specialty?: string
          profile_photo_url?: string | null
          rejection_reason?: string | null
          secondary_specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          years_in_practice?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          base_price: number | null
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
          base_price?: number | null
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
          base_price?: number | null
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
      resources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          provider_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          provider_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          provider_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          provider_id: string
          role: string
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          provider_id: string
          role?: string
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          provider_id?: string
          role?: string
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_provider: { Args: { _provider_id: string }; Returns: boolean }
      get_all_providers: {
        Args: never
        Returns: {
          city: string
          clinic_name: string
          created_at: string
          email: string
          id: string
          phone: string
          practice_type: string
          primary_specialty: string
          status: string
          user_id: string
        }[]
      }
      get_provider_details: {
        Args: { _provider_id: string }
        Returns: {
          address: string
          approved_at: string
          bio: string
          city: string
          clinic_name: string
          created_at: string
          credentials: string
          email: string
          id: string
          phone: string
          practice_type: string
          primary_specialty: string
          rejection_reason: string
          secondary_specialties: string[]
          status: string
          user_id: string
          website: string
          years_in_practice: string
        }[]
      }
      get_provider_status: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      get_user_total_spend: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_provider: {
        Args: { _provider_id: string; _reason: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "provider" | "admin"
      membership_tier: "member" | "premium" | "luxury" | "elite"
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
      app_role: ["user", "provider", "admin"],
      membership_tier: ["member", "premium", "luxury", "elite"],
    },
  },
} as const
