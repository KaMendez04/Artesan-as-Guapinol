import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface ProfileState {
  avatarUrl: string | null
  whatsappPhone: string
  setAvatarUrl: (avatarUrl: string | null) => void
  resetAvatarUrl: () => void
  setWhatsappPhone: (phone: string) => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      avatarUrl: null,
      whatsappPhone: "84131678",
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      resetAvatarUrl: () => set({ avatarUrl: null }),
      setWhatsappPhone: (phone) => set({ whatsappPhone: phone }),
    }),
    {
      name: "arte-guapinol-profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

