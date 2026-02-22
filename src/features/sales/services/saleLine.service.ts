import { supabase } from "@/lib/supabase"

export type SaleLine = {
  idSaleLine: number
  idSale: string
  idCategory: number
  qty: number
  unitPrice: number
  subtotal: number
  oweMoney: boolean
  created_at: string
}

export async function listSaleLines(idSale: string): Promise<SaleLine[]> {
  const { data, error } = await supabase
    .from("SaleLine")
    .select("idSaleLine, idSale, idCategory, qty, unitPrice, subtotal, oweMoney, created_at")
    .eq("idSale", idSale)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []) as SaleLine[]
}

export async function insertSaleLine(payload: {
  idSale: string
  idCategory: number
  qty: number
  unitPrice: number
  subtotal: number
  oweMoney: boolean
}): Promise<void> {
  const { error } = await supabase.from("SaleLine").insert(payload)
  if (error) throw error
}

export async function updateSaleLine(payload: {
  idSaleLine: number
  qty?: number
  unitPrice?: number
  subtotal?: number
  oweMoney?: boolean
  idCategory?: number
}): Promise<void> {
  const { idSaleLine, ...rest } = payload
  const { error } = await supabase.from("SaleLine").update(rest).eq("idSaleLine", idSaleLine)
  if (error) throw error
}

export async function deleteSaleLine(idSaleLine: number): Promise<void> {
  const { error } = await supabase.from("SaleLine").delete().eq("idSaleLine", idSaleLine)
  if (error) throw error
}