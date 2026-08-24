import { create } from "zustand";

import { User } from "@/lib/types";

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  hydrateFromStorage: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }

    set((state) => ({ token, user: token ? state.user : null }));
  },
  setUser: (user) => set({ user }),
  hydrateFromStorage: () => {
    if (typeof window === "undefined") {
      set({ hydrated: true });
      return;
    }

    set({ token: localStorage.getItem("token"), hydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    set({ token: null, user: null, hydrated: true });
  }
}));
