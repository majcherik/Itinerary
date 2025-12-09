export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accommodation: {
        Row: {
          id: number;
          trip_id: number;
          name: string;
          address: string | null;
          check_in: string | null;
          check_out: string | null;
          booking_reference: string | null;
          notes: string | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          name: string;
          address?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          booking_reference?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          name?: string;
          address?: string | null;
          check_in?: string | null;
          check_out?: string | null;
          booking_reference?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: number;
          trip_id: number;
          title: string;
          content: string | null;
          file_url: string | null;
          type: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          title: string;
          content?: string | null;
          file_url?: string | null;
          type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          title?: string;
          content?: string | null;
          file_url?: string | null;
          type?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: number;
          trip_id: number;
          payer: string;
          amount: number;
          description: string;
          date: string | null;
          category: string | null;
          split_with: any | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          payer: string;
          amount: number;
          description: string;
          date?: string | null;
          category?: string | null;
          split_with?: any | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          payer?: string;
          amount?: number;
          description?: string;
          date?: string | null;
          category?: string | null;
          split_with?: any | null;
          created_at?: string;
        };
      };
      itinerary_items: {
        Row: {
          id: number;
          trip_id: number;
          day: string | null;
          time: any | null;
          activity: string;
          location: string | null;
          notes: string | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          day?: string | null;
          time?: any | null;
          activity: string;
          location?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          day?: string | null;
          time?: any | null;
          activity?: string;
          location?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
      };
      packing_items: {
        Row: {
          id: number;
          trip_id: number;
          item: string;
          category: string | null;
          is_packed: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          item: string;
          category?: string | null;
          is_packed?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          item?: string;
          category?: string | null;
          is_packed?: boolean | null;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: number;
          trip_id: number;
          type: string;
          provider: string | null;
          reference_number: string | null;
          departure_time: string | null;
          arrival_time: string | null;
          file_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          type: string;
          provider?: string | null;
          reference_number?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          file_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          type?: string;
          provider?: string | null;
          reference_number?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          file_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      transport: {
        Row: {
          id: number;
          trip_id: number;
          type: string;
          provider: string | null;
          departure_location: string | null;
          arrival_location: string | null;
          departure_time: string | null;
          arrival_time: string | null;
          booking_reference: string | null;
          notes: string | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          trip_id: number;
          type: string;
          provider?: string | null;
          departure_location?: string | null;
          arrival_location?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          booking_reference?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          trip_id?: number;
          type?: string;
          provider?: string | null;
          departure_location?: string | null;
          arrival_location?: string | null;
          departure_time?: string | null;
          arrival_time?: string | null;
          booking_reference?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
      };
      trips: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          start_date: string | null;
          end_date: string | null;
          city: string | null;
          hero_image: string | null;
          created_at: string;
          visa_status: string | null;
          visa_info: string | null;
          members: any | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          start_date?: string | null;
          end_date?: string | null;
          city?: string | null;
          hero_image?: string | null;
          created_at?: string;
          visa_status?: string | null;
          visa_info?: string | null;
          members?: any | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          start_date?: string | null;
          end_date?: string | null;
          city?: string | null;
          hero_image?: string | null;
          created_at?: string;
          visa_status?: string | null;
          visa_info?: string | null;
          members?: any | null;
        };
      };
    };

    Views: {
      [_ in never]: never
    };

    Functions: {
      [_ in never]: never
    };

    Enums: {
      [_ in never]: never
    };

    CompositeTypes: {
      [_ in never]: never
    };

  };
}
