import { supabase } from "@/lib/supabase"

export async function listUniquePricesByCategory(idCategory: number): Promise<number[]> {
  const { data, error } = await supabase
    .from("Product")
    .select("price")
    .eq("idCategory", idCategory)
    .eq("state", "active")

  if (error) throw error

  // Normaliza y elimina repetidos
  const prices = (data ?? []).map((r: any) => Number(r.price ?? 0)).filter((p) => p > 0)
  const unique = Array.from(new Set(prices)).sort((a, b) => a - b)

  return unique
}