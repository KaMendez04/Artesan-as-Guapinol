import { supabase } from "@/lib/supabase"
import type { Category } from "../types/sale.types"

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("Category")
    .select("idCategory, name, state")
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Category[]
}