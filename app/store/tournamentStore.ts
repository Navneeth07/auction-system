import { create } from "zustand";
import {TournamentPayload} from '../lib/api/types'

type TournamentStore = {
  tournament: (TournamentPayload & { _id?: string }) | null;
  setTournament: (tournament: TournamentPayload & { _id?: string }) => void;
  clearTournament: () => void;
};

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournament: null,

  setTournament: (tournament) => set({ tournament }),

  clearTournament: () => set({ tournament: null }),
}));