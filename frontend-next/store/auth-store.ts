"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Role, User } from "@/shared/types/domain";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  role: Role | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user, role: user.role }),
      clearSession: () => set({ token: null, user: null, role: null }),
      setHydrated: (hydrated) => set({ hydrated })
    }),
    {
      name: "rn-auth-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
