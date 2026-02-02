import { create } from "zustand";

export type Tournament = {
  name: string;
  date: string;
  budget: number;
  basePrice: number;
  biddingPrice: number;
  minPlayers: number;
  maxPlayers: number;
  rules: string;
};

type TournamentStore = {
  tournament: Tournament | null;

  setTournament: (tournament: Tournament) => void;
  updateTournament: (data: Partial<Tournament>) => void;
  clearTournament: () => void;
};

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournament: null,

  setTournament: (tournament) =>
    set({
      tournament,
    }),

  updateTournament: (data) =>
    set((state) => ({
      tournament: state.tournament ? { ...state.tournament, ...data } : null,
    })),

  clearTournament: () =>
    set({
      tournament: null,
    }),
}));
