import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

const FALLBACK_PHONE = "+50684131678"

export function useStorePhone() {
  return useQuery({
    queryKey: ["store-phone"],
    queryFn: async () => {
      try {
        const { data } = await supabase.rpc("get_store_whatsapp_phone")
        return (data as string | null) ?? null
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 0,
  })
}

export function formatWhatsappPhone(rawPhone: string | null | undefined): string {
  if (!rawPhone) return FALLBACK_PHONE
  if (rawPhone.startsWith("+")) return rawPhone
  if (rawPhone.startsWith("506")) return `+${rawPhone}`
  return `+506${rawPhone}`
}
