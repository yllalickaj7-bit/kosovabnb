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
          check_in: string
          check_out: string
          created_at: string
          guest_email: string
          guest_id: string | null
          guest_name: string
          guest_phone: string | null
          guests: number
          id: string
          listing_id: string
          nights: number | null
          notes: string | null
          price_per_night: number
          room_id: string
          service_fee: number
          source: string
          status: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_email: string
          guest_id?: string | null
          guest_name: string
          guest_phone?: string | null
          guests?: number
          id?: string
          listing_id: string
          nights?: number | null
          notes?: string | null
          price_per_night: number
          room_id: string
          service_fee?: number
          source?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_email?: string
          guest_id?: string | null
          guest_name?: string
          guest_phone?: string | null
          guests?: number
          id?: string
          listing_id?: string
          nights?: number | null
          notes?: string | null
          price_per_night?: number
          room_id?: string
          service_fee?: number
          source?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal?: number
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_occupancy_30d"
            referencedColumns: ["listing_id"]
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
          created_at: string
          id: string
          language: string
          listing_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          listing_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          listing_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_occupancy_30d"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "chat_conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_name: string | null
          tool_payload: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_name?: string | null
          tool_payload?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_name?: string | null
          tool_payload?: Json | null
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
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          currency: string
          dates: string
          description: string | null
          distance: string
          guests: number | null
          host_avatar: string | null
          host_name: string | null
          id: string
          images_url: string[]
          is_active: boolean
          lat: number | null
          lng: number | null
          location: string
          owner_id: string | null
          price: number
          rating: number
          title: string
          type: string
        }
        Insert: {
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string
          dates?: string
          description?: string | null
          distance?: string
          guests?: number | null
          host_avatar?: string | null
          host_name?: string | null
          id?: string
          images_url?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          location: string
          owner_id?: string | null
          price: number
          rating?: number
          title: string
          type: string
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          currency?: string
          dates?: string
          description?: string | null
          distance?: string
          guests?: number | null
          host_avatar?: string | null
          host_name?: string | null
          id?: string
          images_url?: string[]
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          location?: string
          owner_id?: string | null
          price?: number
          rating?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          card_brand: string | null
          card_last4: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          is_simulated: boolean
          method: string
          provider_ref: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          is_simulated?: boolean
          method?: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          is_simulated?: boolean
          method?: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
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
          confidence: number | null
          created_at: string
          current_price: number
          decided_at: string | null
          explanation: string | null
          factors: Json
          id: string
          model_version: string
          recommended_price: number
          room_id: string
          status: Database["public"]["Enums"]["recommendation_status"]
          stay_date: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          current_price: number
          decided_at?: string | null
          explanation?: string | null
          factors?: Json
          id?: string
          model_version?: string
          recommended_price: number
          room_id: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          stay_date: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          current_price?: number
          decided_at?: string | null
          explanation?: string | null
          factors?: Json
          id?: string
          model_version?: string
          recommended_price?: number
          room_id?: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          stay_date?: string
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
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          kind: string
          listing_id: string | null
          multiplier: number
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          kind: string
          listing_id?: string | null
          multiplier: number
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          listing_id?: string | null
          multiplier?: number
          name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_occupancy_30d"
            referencedColumns: ["listing_id"]
          },
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
          created_at: string
          full_name: string | null
          id: string
          language: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          language?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          guest_id: string | null
          id: string
          listing_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          listing_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          guest_id?: string | null
          id?: string
          listing_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_occupancy_30d"
            referencedColumns: ["listing_id"]
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
          created_at: string
          price: number
          room_id: string
          source: string
          stay_date: string
        }
        Insert: {
          created_at?: string
          price: number
          room_id: string
          source?: string
          stay_date: string
        }
        Update: {
          created_at?: string
          price?: number
          room_id?: string
          source?: string
          stay_date?: string
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
          base_price: number
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          listing_id: string
          max_price: number | null
          min_price: number | null
          name: string
          room_type: string
        }
        Insert: {
          base_price: number
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          listing_id: string
          max_price?: number | null
          min_price?: number | null
          name: string
          room_type?: string
        }
        Update: {
          base_price?: number
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string
          max_price?: number | null
          min_price?: number | null
          name?: string
          room_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_occupancy_30d"
            referencedColumns: ["listing_id"]
          },
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      listing_occupancy_30d: {
        Row: {
          booked_nights: number | null
          listing_id: string | null
          occupancy_rate: number | null
          rooms: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      become_host: { Args: never; Returns: undefined }
      check_availability: {
        Args: {
          _check_in: string
          _check_out: string
          _guests?: number
          _listing_id: string
        }
        Returns: {
          base_price: number
          capacity: number
          room_id: string
          room_name: string
          room_type: string
        }[]
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
      decide_price_recommendation: {
        Args: { _accept: boolean; _id: string }
        Returns: undefined
      }
      generate_price_recommendations: {
        Args: { _days?: number; _listing_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      nightly_price: {
        Args: { _night: string; _room_id: string }
        Returns: number
      }
      quote_stay: {
        Args: { _check_in: string; _check_out: string; _room_id: string }
        Returns: {
          nights: number
          service_fee: number
          subtotal: number
          total: number
        }[]
      }
      simulate_payment: {
        Args: { _booking_id: string; _card_number: string; _expiry: string }
        Returns: {
          message: string
          payment_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }[]
      }
    }
    Enums: {
      app_role: "guest" | "host" | "admin"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      recommendation_status: "suggested" | "accepted" | "rejected"
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
    Enums: {
      app_role: ["guest", "host", "admin"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      recommendation_status: ["suggested", "accepted", "rejected"],
    },
  },
} as const
