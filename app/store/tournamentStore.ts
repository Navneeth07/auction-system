import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {TournamentPayload} from '../lib/api/types'

type TournamentStore = {
  tournament: (TournamentPayload & { _id?: string }) | null;
  setTournament: (tournament: TournamentPayload & { _id?: string }) => void;
  clearTournament: () => void;
};

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      tournament: null,

      setTournament: (tournament) => set({ tournament }),

      clearTournament: () => set({ tournament: null }),
    }),
    {
      name: "tournament-storage", // unique name for localStorage key
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      skipHydration: false,
    }
  )
);