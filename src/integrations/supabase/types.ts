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
      booking_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          slot_date: string
          slot_number: number
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          slot_date: string
          slot_number: number
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          slot_date?: string
          slot_number?: number
          start_time?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          admin_notes: string | null
          agreed_price: number | null
          client_name: string
          client_token: string | null
          confirmation_sent: boolean | null
          created_at: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          id: string
          inspiration_image_url: string | null
          late_warning_sent: boolean | null
          mpesa_checkout_id: string | null
          mpesa_receipt: string | null
          notes: string | null
          payment_expires_at: string | null
          payment_phone: string | null
          payment_screenshot_url: string | null
          payment_status: string | null
          phone_number: string
          price_charged: number | null
          reminder_sent: boolean | null
          screenshot_payment_url: string | null
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
          transaction_code: string | null
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admin_notes?: string | null
          agreed_price?: number | null
          client_name: string
          client_token?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          inspiration_image_url?: string | null
          late_warning_sent?: boolean | null
          mpesa_checkout_id?: string | null
          mpesa_receipt?: string | null
          notes?: string | null
          payment_expires_at?: string | null
          payment_phone?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string | null
          phone_number: string
          price_charged?: number | null
          reminder_sent?: boolean | null
          screenshot_payment_url?: string | null
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          transaction_code?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admin_notes?: string | null
          agreed_price?: number | null
          client_name?: string
          client_token?: string | null
          confirmation_sent?: boolean | null
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          id?: string
          inspiration_image_url?: string | null
          late_warning_sent?: boolean | null
          mpesa_checkout_id?: string | null
          mpesa_receipt?: string | null
          notes?: string | null
          payment_expires_at?: string | null
          payment_phone?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string | null
          phone_number?: string
          price_charged?: number | null
          reminder_sent?: boolean | null
          screenshot_payment_url?: string | null
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          transaction_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          citations: Json | null
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
          tokens: number | null
        }
        Insert: {
          citations?: Json | null
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
          tokens?: number | null
        }
        Update: {
          citations?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
          tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          client_token: string
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          client_token: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          client_token?: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chunks: {
        Row: {
          chunk_index: number
          content: string
          document_id: string | null
          embedding: string | null
          id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          chunk_index: number
          content: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          updated_at?: string | null
          url: string
        }
        Update: {
          chunk_index?: number
          content?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          preferred_contact: string | null
          project_details: string | null
          service_type: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          preferred_contact?: string | null
          project_details?: string | null
          service_type?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          preferred_contact?: string | null
          project_details?: string | null
          service_type?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          chunk_count: number | null
          hash: string | null
          id: string
          title: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          chunk_count?: number | null
          hash?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          chunk_count?: number | null
          hash?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          created_at: string
          gallery_type: string
          id: string
          image_path: string
          sort_order: number
          styles: string[]
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          gallery_type?: string
          id?: string
          image_path: string
          sort_order?: number
          styles?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          gallery_type?: string
          id?: string
          image_path?: string
          sort_order?: number
          styles?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          message_id: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          template_content: string
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          template_content: string
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          template_content?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_queue: {
        Row: {
          booking_id: string
          client_phone: string
          created_at: string
          id: string
          request_sent: boolean | null
        }
        Insert: {
          booking_id: string
          client_phone: string
          created_at?: string
          id?: string
          request_sent?: boolean | null
        }
        Update: {
          booking_id?: string
          client_phone?: string
          created_at?: string
          id?: string
          request_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "review_queue_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          client_name: string | null
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          rating: number
          review_text: string | null
        }
        Insert: {
          booking_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          rating: number
          review_text?: string | null
        }
        Update: {
          booking_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      slot_configuration: {
        Row: {
          created_at: string
          day_of_week: number
          duration_minutes: number
          end_time: string
          id: string
          is_active: boolean | null
          slot_number: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_number: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          duration_minutes?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_number?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      check_booking_status: {
        Args: { booking_id: string }
        Returns: {
          deposit_paid: boolean
          id: string
          payment_status: string
          status: string
        }[]
      }
      generate_slots_for_date: {
        Args: { target_date: string }
        Returns: undefined
      }
      get_chat_analytics: {
        Args: never
        Returns: {
          avg_rating: number
          messages_today: number
          sessions_today: number
          total_feedback: number
          total_messages: number
          total_sessions: number
        }[]
      }
      get_popular_questions: {
        Args: { limit_count?: number }
        Returns: {
          count: number
          question: string
        }[]
      }
      get_recent_feedback: {
        Args: { limit_count?: number }
        Returns: {
          comment: string
          created_at: string
          id: string
          message_content: string
          rating: number
        }[]
      }
      get_security_summary: {
        Args: { hours_back?: number }
        Returns: {
          count: number
          event_type: string
          latest_at: string
          severity: string
          unique_ips: number
        }[]
      }
      get_slot_availability: {
        Args: { target_date: string }
        Returns: {
          client_name: string
          end_time: string
          slot_id: string
          slot_number: number
          start_time: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          similarity: number
          url: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "upcoming"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "no_show"
        | "pending_payment"
        | "pending_verification"
        | "confirmed"
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
      app_role: ["admin", "user"],
      booking_status: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
        "no_show",
        "pending_payment",
        "pending_verification",
        "confirmed",
      ],
    },
  },
} as const
