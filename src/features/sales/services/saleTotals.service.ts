import { supabase } from "@/lib/supabase"

export async function recomputeSaleSubtotalFromLines(idSale: string): Promise<number> {
  const { data, error } = await supabase
    .from("SaleLine")
    .select("subtotal")
    .eq("idSale", idSale)

  if (error) throw error

  const subtotal = (data ?? []).reduce((acc: number, r: any) => acc + Number(r.subtotal ?? 0), 0)

  const { error: updErr } = await supabase
    .from("Sale")
    .update({ subtotal })
    .eq("idSale", idSale)

  if (updErr) throw updErr

  return subtotal
}