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
      cases: {
        Row: {
          assigned_date: string
          case_remarks: string | null
          connectivity: string | null
          created_at: string
          due_date: string
          id: string
          ip_address: string | null
          lead_ckt: string
          status: string | null
        }
        Insert: {
          assigned_date: string
          case_remarks?: string | null
          connectivity?: string | null
          created_at?: string
          due_date: string
          id?: string
          ip_address?: string | null
          lead_ckt: string
          status?: string | null
        }
        Update: {
          assigned_date?: string
          case_remarks?: string | null
          connectivity?: string | null
          created_at?: string
          due_date?: string
          id?: string
          ip_address?: string | null
          lead_ckt?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_lead_ckt_fkey"
            columns: ["lead_ckt"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["ckt"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          backup: string | null
          bandwidth: string | null
          ckt: string
          comm_date: string | null
          contact_name: string | null
          created_at: string
          cust_name: string
          device: string | null
          email_id: string | null
          gateway: string | null
          id: string
          mrtg: string | null
          nas_ip_1: string | null
          nas_ip_2: string | null
          pop_name: string | null
          pop_name_2: string | null
          port_no_1: string | null
          port_no_2: string | null
          primary_pop: string | null
          remarks: string | null
          sales_person: string | null
          sr_no: string
          subnet_mask: string | null
          switch_ip_1: string | null
          switch_ip_2: string | null
          testing_fe: string | null
          usable_ip_address: string | null
          vlan_id_1: string | null
          vlan_id_2: string | null
        }
        Insert: {
          address?: string | null
          backup?: string | null
          bandwidth?: string | null
          ckt: string
          comm_date?: string | null
          contact_name?: string | null
          created_at?: string
          cust_name: string
          device?: string | null
          email_id?: string | null
          gateway?: string | null
          id?: string
          mrtg?: string | null
          nas_ip_1?: string | null
          nas_ip_2?: string | null
          pop_name?: string | null
          pop_name_2?: string | null
          port_no_1?: string | null
          port_no_2?: string | null
          primary_pop?: string | null
          remarks?: string | null
          sales_person?: string | null
          sr_no: string
          subnet_mask?: string | null
          switch_ip_1?: string | null
          switch_ip_2?: string | null
          testing_fe?: string | null
          usable_ip_address?: string | null
          vlan_id_1?: string | null
          vlan_id_2?: string | null
        }
        Update: {
          address?: string | null
          backup?: string | null
          bandwidth?: string | null
          ckt?: string
          comm_date?: string | null
          contact_name?: string | null
          created_at?: string
          cust_name?: string
          device?: string | null
          email_id?: string | null
          gateway?: string | null
          id?: string
          mrtg?: string | null
          nas_ip_1?: string | null
          nas_ip_2?: string | null
          pop_name?: string | null
          pop_name_2?: string | null
          port_no_1?: string | null
          port_no_2?: string | null
          primary_pop?: string | null
          remarks?: string | null
          sales_person?: string | null
          sr_no?: string
          subnet_mask?: string | null
          switch_ip_1?: string | null
          switch_ip_2?: string | null
          testing_fe?: string | null
          usable_ip_address?: string | null
          vlan_id_1?: string | null
          vlan_id_2?: string | null
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
