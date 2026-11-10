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
          id: string
          listing_id: string
          room_id: string
          guest_id: string | null
          guest_name: string
          guest_email: string
          guest_phone: string | null
          check_in: string
          check_out: string
          guests: number
          nights: number | null
          price_per_night: number
          subtotal: number
          service_fee: number
          total_price: number
          status: Database["public"]["Enums"]["booking_status"]
          source: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          room_id: string
          guest_id?: string | null
          guest_name: string
          guest_email: string
          guest_phone?: string | null
          check_in: string
          check_out: string
          guests?: number
          nights?: never
          price_per_night: number
          subtotal: number
          service_fee?: number
          total_price: number
          status?: Database["public"]["Enums"]["booking_status"]
          source?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          room_id?: string
          guest_id?: string | null
          guest_name?: string
          guest_email?: string
          guest_phone?: string | null
          check_in?: string
          check_out?: string
          guests?: number
          nights?: never
          price_per_night?: number
          subtotal?: number
          service_fee?: number
          total_price?: number
          status?: Database["public"]["Enums"]["booking_status"]
          source?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          listing_id: string | null
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          listing_id?: string | null
          language?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          listing_id?: string | null
          language?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          tool_name: string | null
          tool_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          tool_name?: string | null
          tool_payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          tool_name?: string | null
          tool_payload?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          id: string
          title: string
          type: string
          price: number
          rating: number
          location: string
          distance: string
          dates: string
          images_url: string[]
          description: string | null
          host_name: string | null
          host_avatar: string | null
          guests: number | null
          bedrooms: number | null
          bathrooms: number | null
          amenities: string[] | null
          created_at: string
          lat: number | null
          lng: number | null
          owner_id: string | null
          currency: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          type: string
          price: number
          rating?: number
          location: string
          distance?: string
          dates?: string
          images_url?: string[]
          description?: string | null
          host_name?: string | null
          host_avatar?: string | null
          guests?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          amenities?: string[] | null
          created_at?: string
          lat?: number | null
          lng?: number | null
          owner_id?: string | null
          currency?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          type?: string
          price?: number
          rating?: number
          location?: string
          distance?: string
          dates?: string
          images_url?: string[]
          description?: string | null
          host_name?: string | null
          host_avatar?: string | null
          guests?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          amenities?: string[] | null
          created_at?: string
          lat?: number | null
          lng?: number | null
          owner_id?: string | null
          currency?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          currency: string
          method: string
          status: Database["public"]["Enums"]["payment_status"]
          card_brand: string | null
          card_last4: string | null
          provider_ref: string | null
          failure_reason: string | null
          is_simulated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          currency?: string
          method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          card_brand?: string | null
          card_last4?: string | null
          provider_ref?: string | null
          failure_reason?: string | null
          is_simulated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          currency?: string
          method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          card_brand?: string | null
          card_last4?: string | null
          provider_ref?: string | null
          failure_reason?: string | null
          is_simulated?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      price_recommendations: {
        Row: {
          id: string
          room_id: string
          stay_date: string
          current_price: number
          recommended_price: number
          confidence: number | null
          factors: Json
          explanation: string | null
          model_version: string
          status: Database["public"]["Enums"]["recommendation_status"]
          created_at: string
          decided_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          stay_date: string
          current_price: number
          recommended_price: number
          confidence?: number | null
          factors?: Json
          explanation?: string | null
          model_version?: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          created_at?: string
          decided_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          stay_date?: string
          current_price?: number
          recommended_price?: number
          confidence?: number | null
          factors?: Json
          explanation?: string | null
          model_version?: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          created_at?: string
          decided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_recommendations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          id: string
          listing_id: string | null
          name: string
          kind: string
          start_date: string | null
          end_date: string | null
          multiplier: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          name: string
          kind: string
          start_date?: string | null
          end_date?: string | null
          multiplier: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          name?: string
          kind?: string
          start_date?: string | null
          end_date?: string | null
          multiplier?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          listing_id: string
          guest_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          listing_id: string
          guest_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          listing_id?: string
          guest_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      room_price_overrides: {
        Row: {
          room_id: string
          stay_date: string
          price: number
          source: string
          created_at: string
        }
        Insert: {
          room_id: string
          stay_date: string
          price: number
          source?: string
          created_at?: string
        }
        Update: {
          room_id?: string
          stay_date?: string
          price?: number
          source?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_price_overrides_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          id: string
          listing_id: string
          name: string
          room_type: string
          capacity: number
          base_price: number
          min_price: number | null
          max_price: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          name: string
          room_type?: string
          capacity?: number
          base_price: number
          min_price?: number | null
          max_price?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          name?: string
          room_type?: string
          capacity?: number
          base_price?: number
          min_price?: number | null
          max_price?: number | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      listing_occupancy_30d: {
        Row: {
          listing_id: string | null
          rooms: number | null
          booked_nights: number | null
          occupancy_rate: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      become_host: { Args: Record<PropertyKey, never>; Returns: undefined }
      check_availability: {
        Args: { _check_in: string; _check_out: string; _guests?: number; _listing_id: string }
        Returns: { base_price: number; capacity: number; room_id: string; room_name: string; room_type: string }[]
      }
      create_booking: {
        Args: {
          _check_in: string
          _check_out: string
          _guest_email: string
          _guest_name: string
          _guest_phone?: string
          _guests: number
          _room_id: string
          _source?: string
        }
        Returns: string
      }
      decide_price_recommendation: { Args: { _accept: boolean; _id: string }; Returns: undefined }
      generate_price_recommendations: { Args: { _days?: number; _listing_id: string }; Returns: number }
      has_role: { Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }; Returns: boolean }
      nightly_price: { Args: { _night: string; _room_id: string }; Returns: number }
      quote_stay: {
        Args: { _check_in: string; _check_out: string; _room_id: string }
        Returns: { nights: number; service_fee: number; subtotal: number; total: number }[]
      }
      simulate_payment: {
        Args: { _booking_id: string; _card_number: string; _expiry: string }
        Returns: { message: string; payment_id: string; status: Database["public"]["Enums"]["payment_status"] }[]
      }
    }
    Enums: {
      app_role:
        | 
"guest"        | "host"        | "admin"
      booking_status:
        | 
"pending"        | "confirmed"        | "cancelled"        | "completed"
      payment_status:
        | 
"pending"        | "succeeded"        | "failed"        | "refunded"
      recommendation_status:
        | 
"suggested"        | "accepted"        | "rejected"
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
      app_role: ["guest", "host", "admin"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      recommendation_status: ["suggested", "accepted", "rejected"],
    },
  },
} as const
