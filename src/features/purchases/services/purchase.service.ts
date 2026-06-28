import { supabase } from "@/lib/supabase"
import type { Purchase, CreatePurchaseDto, UpdatePurchaseDto } from "../types/purchase.types"

const TABLE = "Compras" as const

export async function getPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, monto, fecha, tienda, created_at")
    .order("fecha", { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createPurchase(dto: CreatePurchaseDto): Promise<Purchase> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([dto])
    .select("id, monto, fecha, tienda, created_at")
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updatePurchase(id: string, dto: UpdatePurchaseDto): Promise<Purchase> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(dto)
    .eq("id", id)
    .select("id, monto, fecha, tienda, created_at")
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePurchase(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function getDistinctTiendas(): Promise<string[]> {
  const { data, error } = await supabase.from(TABLE).select("tienda")
  if (error) throw new Error(error.message)
  const unique = [...new Set((data ?? []).map((r) => r.tienda as string).filter(Boolean))]
  return unique.sort((a, b) => a.localeCompare(b, "es"))
}
