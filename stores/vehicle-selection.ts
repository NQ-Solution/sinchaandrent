'use client';

import { create } from 'zustand';
import type { RentPeriod, VehicleSelection } from '@/types';

interface VehicleSelectionState {
  selection: VehicleSelection;
  setVehicleId: (vehicleId: string) => void;
  setTrimId: (trimId: string | undefined) => void;
  setExteriorColorId: (colorId: string | undefined) => void;
  setInteriorColorId: (colorId: string | undefined) => void;
  toggleOption: (optionId: string) => void;
  setPeriod: (period: RentPeriod) => void;
  reset: () => void;
}

const initialSelection: VehicleSelection = {
  vehicleId: '',
  trimId: undefined,
  exteriorColorId: undefined,
  interiorColorId: undefined,
  optionIds: [],
  period: 60,
};

export const useVehicleSelectionStore = create<VehicleSelectionState>((set) => ({
  selection: initialSelection,

  setVehicleId: (vehicleId) =>
    set((state) => ({
      selection: { ...initialSelection, vehicleId, period: state.selection.period },
    })),

  setTrimId: (trimId) =>
    set((state) => ({
      selection: { ...state.selection, trimId },
    })),

  setExteriorColorId: (colorId) =>
    set((state) => ({
      selection: { ...state.selection, exteriorColorId: colorId },
    })),

  setInteriorColorId: (colorId) =>
    set((state) => ({
      selection: { ...state.selection, interiorColorId: colorId },
    })),

  toggleOption: (optionId) =>
    set((state) => {
      const optionIds = state.selection.optionIds.includes(optionId)
        ? state.selection.optionIds.filter((id) => id !== optionId)
        : [...state.selection.optionIds, optionId];
      return {
        selection: { ...state.selection, optionIds },
      };
    }),

  setPeriod: (period) =>
    set((state) => ({
      selection: { ...state.selection, period },
    })),

  reset: () => set({ selection: initialSelection }),
}));
