import { supabase } from "@/lib/supabase"

export type SaleCategoryRow = {
  idSaleCategory: number
  total: number
  idCategory: number
  idSale: string
}

export async function listSaleCategories(idSale: string): Promise<SaleCategoryRow[]> {
  const { data, error } = await supabase
    .from("SaleCategory")
    .select("idSaleCategory, total, idCategory, idSale")
    .eq("idSale", idSale)
    .order("idSaleCategory", { ascending: true })

  if (error) throw error
  return (data ?? []) as SaleCategoryRow[]
}

/**
 * ✅ Upsert manual SIN onConflict (porque tu tabla no tiene UNIQUE(idSale,idCategory))
 * - Si ya existe línea (idSale + idCategory) => UPDATE total
 * - Si no existe => INSERT
 */
export async function upsertSaleCategoryLine(payload: {
  idSale: string
  idCategory: number
  total: number
}): Promise<void> {
  // 1) buscar existente
  const { data: existing, error: findErr } = await supabase
    .from("SaleCategory")
    .select("idSaleCategory")
    .eq("idSale", payload.idSale)
    .eq("idCategory", payload.idCategory)
    .maybeSingle()

  if (findErr) throw findErr

  // 2) update o insert
  if (existing?.idSaleCategory) {
    const { error: updErr } = await supabase
      .from("SaleCategory")
      .update({ total: payload.total })
      .eq("idSaleCategory", existing.idSaleCategory)

    if (updErr) throw updErr
    return
  }

  const { error: insErr } = await supabase
    .from("SaleCategory")
    .insert({
      idSale: payload.idSale,
      idCategory: payload.idCategory,
      total: payload.total,
    })

  if (insErr) throw insErr
}

export async function deleteSaleCategoryLine(payload: { idSaleCategory: number }): Promise<void> {
  const { error } = await supabase
    .from("SaleCategory")
    .delete()
    .eq("idSaleCategory", payload.idSaleCategory)

  if (error) throw error
}

export async function recomputeSaleSubtotal(idSale: string): Promise<number> {
  const { data, error } = await supabase
    .from("SaleCategory")
    .select("total")
    .eq("idSale", idSale)

  if (error) throw error

  return (data ?? []).reduce((acc: number, r: any) => acc + Number(r.total ?? 0), 0)
}