import { create } from "zustand";

type User = {
  id: string;
  fullName: string;
  email: string;
};

type AuthStore = {
  user: User | null;
  accessToken: string | null;
  register: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,

  register: (user, token) =>
    set({
      user,
      accessToken: token,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
