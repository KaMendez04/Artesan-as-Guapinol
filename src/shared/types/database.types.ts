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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          whatsapp_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          whatsapp_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          whatsapp_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      Compras: {
        Row: {
          id: string
          monto: number
          fecha: string
          tienda: string
          created_at: string
        }
        Insert: {
          id?: string
          monto: number
          fecha: string
          tienda: string
          created_at?: string
        }
        Update: {
          id?: string
          monto?: number
          fecha?: string
          tienda?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          cost: number | null
          sku: string | null
          category: string | null
          stock: number
          min_stock: number
          image_url: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          cost?: number | null
          sku?: string | null
          category?: string | null
          stock?: number
          min_stock?: number
          image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          cost?: number | null
          sku?: string | null
          category?: string | null
          stock?: number
          min_stock?: number
          image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          total: number
          subtotal: number
          tax: number
          discount: number
          status: string
          payment_method: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          total: number
          subtotal: number
          tax?: number
          discount?: number
          status?: string
          payment_method?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          total?: number
          subtotal?: number
          tax?: number
          discount?: number
          status?: string
          payment_method?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
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
