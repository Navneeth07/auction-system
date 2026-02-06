import { create } from "zustand"
import { useTournamentStore } from "./tournamentStore"
import { useRoleStore } from "./roleStore"

type User = {
  id: string
  fullName: string
  email: string
}

type AuthStore = {
  user: User | null
  accessToken: string | null

  register: (user: User, token: string) => void
  login: (user: User, token: string) => void
  logout: () => void
  logoutAsync: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,

  register: (user, token) =>
    set({
      user,
      accessToken: token,
    }),

  login: (user, token) =>
    set({
      user,
      accessToken: token,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),

  logoutAsync: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Server logout failed', e);
    }

    // Clear client-side stores
    set({ user: null, accessToken: null });
    try {
      useTournamentStore.getState().clearTournament();
      useRoleStore.getState().clearRoles();
    } catch (e) {
      // ignore
    }

    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
}))
