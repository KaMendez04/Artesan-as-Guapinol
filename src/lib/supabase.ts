import { createClient, type SupportedStorage } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables missing")
}

const isNative = Capacitor.isNativePlatform()

// 🔵 Storage para mobile (APK)
const capacitorStorage: SupportedStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key })
    return value
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value })
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key })
  },
}

// 🟢 Storage para web (NO persistente al cerrar navegador)
const sessionStorageAdapter: SupportedStorage = {
  getItem: async (key: string) => sessionStorage.getItem(key),
  setItem: async (key: string, value: string) => {
    sessionStorage.setItem(key, value)
  },
  removeItem: async (key: string) => {
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: isNative ? capacitorStorage : sessionStorageAdapter,
  },
})