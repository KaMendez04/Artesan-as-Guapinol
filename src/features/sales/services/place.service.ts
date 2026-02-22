import { supabase } from "@/lib/supabase"

export type Place = { idPlace: number; name: string }

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from("Place")
    .select("idPlace, name")
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []) as Place[]
}

export async function getOrCreatePlaceByName(nameRaw: string): Promise<Place> {
  const name = nameRaw.trim()
  if (!name) throw new Error("Nombre de lugar requerido")

  // 1) buscar si ya existe (case-sensitive en DB; aquí comparamos exacto)
  const { data: found, error: findErr } = await supabase
    .from("Place")
    .select("idPlace, name")
    .eq("name", name)
    .maybeSingle()

  if (findErr) throw findErr
  if (found) return found as Place

  // 2) crear si no existe
  const { data: created, error: createErr } = await supabase
    .from("Place")
    .insert({ name })
    .select("idPlace, name")
    .single()

  if (createErr) throw createErr
  return created as Place
}