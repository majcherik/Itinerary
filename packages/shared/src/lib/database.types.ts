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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accommodation: {
        Row: {
          address: string | null
          booking_reference: string | null
          check_in: string | null
          check_out: string | null
          cost: number | null
          created_at: string
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          trip_id: number
        }
        Insert: {
          address?: string | null
          booking_reference?: string | null
          check_in?: string | null
          check_out?: string | null
          cost?: number | null
          created_at?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          trip_id: number
        }
        Update: {
          address?: string | null
          booking_reference?: string | null
          check_in?: string | null
          check_out?: string | null
          cost?: number | null
          created_at?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      account_deletions: {
        Row: {
          id: string
          reason: string | null
          requested_at: string
          scheduled_deletion_at: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          reason?: string | null
          requested_at?: string
          scheduled_deletion_at: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          reason?: string | null
          requested_at?: string
          scheduled_deletion_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: number
          title: string
          trip_id: number
          type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: number
          title: string
          trip_id: number
          type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: number
          title?: string
          trip_id?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_trip_id_fkey"
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
          category: string | null
          created_at: string
          date: string | null
          description: string
          id: number
          payer: string
          split_with: Json | null
          trip_id: number
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string | null
          description: string
          id?: number
          payer: string
          split_with?: Json | null
          trip_id: number
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string
          id?: number
          payer?: string
          split_with?: Json | null
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          activity: string
          cost: number | null
          created_at: string
          day: string | null
          id: number
          latitude: number | null
          location: string | null
          location_name: string | null
          longitude: number | null
          notes: string | null
          time: string | null
          trip_id: number
        }
        Insert: {
          activity: string
          cost?: number | null
          created_at?: string
          day?: string | null
          id?: number
          latitude?: number | null
          location?: string | null
          location_name?: string | null
          longitude?: number | null
          notes?: string | null
          time?: string | null
          trip_id: number
        }
        Update: {
          activity?: string
          cost?: number | null
          created_at?: string
          day?: string | null
          id?: number
          latitude?: number | null
          location?: string | null
          location_name?: string | null
          longitude?: number | null
          notes?: string | null
          time?: string | null
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_items: {
        Row: {
          category: string | null
          created_at: string
          id: number
          is_packed: boolean | null
          item: string
          trip_id: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
          is_packed?: boolean | null
          item: string
          trip_id: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
          is_packed?: boolean | null
          item?: string
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "packing_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_trips: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          password_hash: string | null
          share_token: string
          trip_id: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          share_token: string
          trip_id: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          password_hash?: string | null
          share_token?: string
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_trips_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          arrival_time: string | null
          created_at: string
          departure_time: string | null
          file_url: string | null
          id: number
          notes: string | null
          provider: string | null
          reference_number: string | null
          trip_id: number
          type: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          file_url?: string | null
          id?: number
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          trip_id: number
          type: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          file_url?: string | null
          id?: number
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          trip_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      transport: {
        Row: {
          arrival_latitude: number | null
          arrival_location: string | null
          arrival_longitude: number | null
          arrival_time: string | null
          booking_reference: string | null
          cost: number | null
          created_at: string
          departure_latitude: number | null
          departure_location: string | null
          departure_longitude: number | null
          departure_time: string | null
          id: number
          notes: string | null
          provider: string | null
          trip_id: number
          type: string
        }
        Insert: {
          arrival_latitude?: number | null
          arrival_location?: string | null
          arrival_longitude?: number | null
          arrival_time?: string | null
          booking_reference?: string | null
          cost?: number | null
          created_at?: string
          departure_latitude?: number | null
          departure_location?: string | null
          departure_longitude?: number | null
          departure_time?: string | null
          id?: number
          notes?: string | null
          provider?: string | null
          trip_id: number
          type: string
        }
        Update: {
          arrival_latitude?: number | null
          arrival_location?: string | null
          arrival_longitude?: number | null
          arrival_time?: string | null
          booking_reference?: string | null
          cost?: number | null
          created_at?: string
          departure_latitude?: number | null
          departure_location?: string | null
          departure_longitude?: number | null
          departure_time?: string | null
          id?: number
          notes?: string | null
          provider?: string | null
          trip_id?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          city: string | null
          created_at: string
          end_date: string | null
          hero_image: string | null
          id: number
          latitude: number | null
          longitude: number | null
          members: Json | null
          start_date: string | null
          title: string
          user_id: string
          visa_info: string | null
          visa_status: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          end_date?: string | null
          hero_image?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          members?: Json | null
          start_date?: string | null
          title: string
          user_id: string
          visa_info?: string | null
          visa_status?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          end_date?: string | null
          hero_image?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          members?: Json | null
          start_date?: string | null
          title?: string
          user_id?: string
          visa_info?: string | null
          visa_status?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          default_currency: string
          id: string
          notification_settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          id?: string
          notification_settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          id?: string
          notification_settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_token: { Args: never; Returns: string }
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
