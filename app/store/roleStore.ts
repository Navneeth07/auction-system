import { create } from "zustand";
import { RolePricing } from "../lib/api/types";

type RolePricingWithOptionalId = Omit<RolePricing, "_id"> & { _id?: string };

type RoleStore = {
  roles: RolePricingWithOptionalId[];
  setRoles: (roles: RolePricing[]) => void;
  addRole: () => void;
  updateRole: (index: number, data: Partial<RolePricingWithOptionalId>) => void;
  removeRole: (index: number) => void;
  clearRoles: () => void;
};


export const useRoleStore = create<RoleStore>((set) => ({
  roles: [{ role: "", basePrice: 0, biddingPrice: 0 }],

  setRoles: (roles) => set({ roles }),

  addRole: () =>
    set((state) => ({
      roles: [...state.roles, { role: "", basePrice: 0, biddingPrice: 0 }],
    })),

  updateRole: (index, data) =>
    set((state) => {
      const updated = [...state.roles];
      updated[index] = { ...updated[index], ...data };
      return { roles: updated };
    }),

  removeRole: (index) =>
    set((state) => ({
      roles:
        state.roles.length === 1
          ? state.roles
          : state.roles.filter((_, i) => i !== index),
    })),

  clearRoles: () => set({ roles: [] }),
}));
