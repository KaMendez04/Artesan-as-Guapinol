import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface ProfileState {
  avatarUrl: string | null
  setAvatarUrl: (avatarUrl: string | null) => void
  resetAvatarUrl: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      avatarUrl: null,
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      resetAvatarUrl: () => set({ avatarUrl: null }),
    }),
    {
      name: "arte-guapinol-profile",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

