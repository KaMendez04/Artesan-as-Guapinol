import { supabase } from "@/lib/supabase"

export type Sale = {
  idSale: string
  subtotal: number
  dateSale: string
  oweMoney: boolean
  idPlace: number
}

export async function getAllSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("Sale")
    .select("idSale, subtotal, dateSale, oweMoney, idPlace")
    .order("dateSale", { ascending: false })

  if (error) throw error
  return (data ?? []) as Sale[]
}

export async function getSaleById(idSale: string): Promise<Sale | null> {
  const { data, error } = await supabase
    .from("Sale")
    .select("idSale, subtotal, dateSale, oweMoney, idPlace")
    .eq("idSale", idSale)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as Sale | null
}

export async function createSale(payload: { idPlace: number; dateSale: Date }): Promise<Sale> {
  const { data, error } = await supabase
    .from("Sale")
    .insert({
      idPlace: payload.idPlace,
      dateSale: payload.dateSale.toISOString(),
      subtotal: 0,
      oweMoney: false,
    })
    .select("idSale, subtotal, dateSale, oweMoney, idPlace")
    .single()

  if (error) throw error
  return data as Sale
}

export async function updateSale(payload: {
  idSale: string
  idPlace?: number
  dateSale?: Date
  oweMoney?: boolean
  subtotal?: number
}): Promise<void> {
  const update: any = {}
  if (payload.idPlace !== undefined) update.idPlace = payload.idPlace
  if (payload.dateSale !== undefined) update.dateSale = payload.dateSale.toISOString()
  if (payload.oweMoney !== undefined) update.oweMoney = payload.oweMoney
  if (payload.subtotal !== undefined) update.subtotal = payload.subtotal

  const { error } = await supabase.from("Sale").update(update).eq("idSale", payload.idSale)
  if (error) throw error
}