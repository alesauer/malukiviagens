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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          date: string | null
          done: boolean
          estimated_cost: number
          family_id: string
          id: string
          location: string | null
          notes: string | null
          time: string | null
          title: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          done?: boolean
          estimated_cost?: number
          family_id: string
          id?: string
          location?: string | null
          notes?: string | null
          time?: string | null
          title: string
          trip_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          done?: boolean
          estimated_cost?: number
          family_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          time?: string | null
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          created_at: string
          done: boolean
          family_id: string
          id: string
          kind: string
          owner_name: string | null
          title: string
          trip_id: string
          responsible_type: string | null
          priority: string | null
          source: string | null
          is_optional: boolean | null
          due_date: string | null
        }
        Insert: {
          created_at?: string
          done?: boolean
          family_id: string
          id?: string
          kind?: string
          owner_name?: string | null
          title: string
          trip_id: string
          responsible_type?: string | null
          priority?: string | null
          source?: string | null
          is_optional?: boolean | null
          due_date?: string | null
        }
        Update: {
          created_at?: string
          done?: boolean
          family_id?: string
          id?: string
          kind?: string
          owner_name?: string | null
          title?: string
          trip_id?: string
          responsible_type?: string | null
          priority?: string | null
          source?: string | null
          is_optional?: boolean | null
          due_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          family_id: string
          file_name: string
          file_path: string
          id: string
          kind: string
          reservation_id: string | null
          title: string
          trip_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          family_id: string
          file_name: string
          file_path: string
          id?: string
          kind?: string
          reservation_id?: string | null
          title: string
          trip_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          family_id?: string
          file_name?: string
          file_path?: string
          id?: string
          kind?: string
          reservation_id?: string | null
          title?: string
          trip_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          family_id: string
          id: string
          name: string
          notes: string | null
          phone: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          trip_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_contacts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          family_id: string
          id: string
          paid: boolean
          paid_by: string | null
          spent_on: string
          trip_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          family_id: string
          id?: string
          paid?: boolean
          paid_by?: string | null
          spent_on?: string
          trip_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          family_id?: string
          id?: string
          paid?: boolean
          paid_by?: string | null
          spent_on?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
          deepseek_api_key: string | null
          openai_api_key: string | null
          ai_provider: string | null
          webhook_url: string | null
          webhook_enabled: boolean | null
          webhook_secret: string | null
          webhook_events: string[] | null
          notification_settings: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
          deepseek_api_key?: string | null
          openai_api_key?: string | null
          ai_provider?: string | null
          webhook_url?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_events?: string[] | null
          notification_settings?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
          deepseek_api_key?: string | null
          openai_api_key?: string | null
          ai_provider?: string | null
          webhook_url?: string | null
          webhook_enabled?: boolean | null
          webhook_secret?: string | null
          webhook_events?: string[] | null
          notification_settings?: Json | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          joined_at: string
          role: string
          user_id: string
          all_trips_access: boolean | null
          allowed_trip_ids: string[] | null
        }
        Insert: {
          family_id: string
          joined_at?: string
          role?: string
          user_id: string
          all_trips_access?: boolean | null
          allowed_trip_ids?: string[] | null
        }
        Update: {
          family_id?: string
          joined_at?: string
          role?: string
          user_id?: string
          all_trips_access?: boolean | null
          allowed_trip_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          address: string | null
          confirmation_code: string | null
          cost: number
          created_at: string
          ends_at: string | null
          family_id: string
          id: string
          kind: string
          maps_url: string | null
          notes: string | null
          paid: boolean
          provider: string | null
          starts_at: string | null
          title: string
          trip_id: string
        }
        Insert: {
          address?: string | null
          confirmation_code?: string | null
          cost?: number
          created_at?: string
          ends_at?: string | null
          family_id: string
          id?: string
          kind?: string
          maps_url?: string | null
          notes?: string | null
          paid?: boolean
          provider?: string | null
          starts_at?: string | null
          title: string
          trip_id: string
        }
        Update: {
          address?: string | null
          confirmation_code?: string | null
          cost?: number
          created_at?: string
          ends_at?: string | null
          family_id?: string
          id?: string
          kind?: string
          maps_url?: string | null
          notes?: string | null
          paid?: boolean
          provider?: string | null
          starts_at?: string | null
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: number
          category: string
          cover_path: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          family_id: string
          id: string
          main_destination: string | null
          photos_url: string | null
          start_date: string
          status: string
          title: string
        }
        Insert: {
          budget?: number
          category?: string
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          family_id: string
          id?: string
          main_destination?: string | null
          photos_url?: string | null
          start_date: string
          status?: string
          title: string
        }
        Update: {
          budget?: number
          category?: string
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          family_id?: string
          id?: string
          main_destination?: string | null
          photos_url?: string | null
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_family_admin: { Args: { _family: string }; Returns: boolean }
      is_family_member: { Args: { _family: string }; Returns: boolean }
      join_family: { Args: { _code: string }; Returns: string }
      shares_family: { Args: { _other: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
