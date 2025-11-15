import { create } from "zustand";

type FiltersState = {
  dateRange?: string;
  diagnosis?: string;
  project?: string;
  patientGroup?: string;
  setFilter: (key: keyof Omit<FiltersState, "setFilter">, value?: string) => void;
};

export const useFilters = create<FiltersState>((set) => ({
  setFilter: (key, value) => set(() => ({ [key]: value })),
}));

