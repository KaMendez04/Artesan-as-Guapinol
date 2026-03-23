import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OfflineSale {
  offlineId: string;
  idPlace: number;
  dateSale: string;
  subtotal: number;
  oweMoney: boolean;
}

export interface OfflineSaleLine {
  offlineId: string; // References OfflineSale.offlineId
  idCategory: number;
  qty: number;
  unitPrice: number;
  subtotal: number;
  oweMoney: boolean;
  sinpe: boolean;
}

interface OfflineState {
  pendingSales: OfflineSale[];
  pendingSaleLines: OfflineSaleLine[];
  
  // Actions
  addPendingSale: (sale: OfflineSale) => void;
  addPendingSaleLine: (line: OfflineSaleLine) => void;
  removePendingSale: (offlineId: string) => void;
  removePendingSaleLine: (offlineId: string, idCategory: number, qty: number) => void;
  clearAll: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      pendingSales: [],
      pendingSaleLines: [],

      addPendingSale: (sale) => 
        set((state) => ({
          pendingSales: [...state.pendingSales, sale]
        })),

      addPendingSaleLine: (line) =>
        set((state) => ({
          pendingSaleLines: [...state.pendingSaleLines, line]
        })),

      removePendingSale: (offlineId) =>
        set((state) => ({
          pendingSales: state.pendingSales.filter(s => s.offlineId !== offlineId),
          pendingSaleLines: state.pendingSaleLines.filter(l => l.offlineId !== offlineId)
        })),

      removePendingSaleLine: (offlineId, idCategory, qty) =>
        set((state) => ({
          pendingSaleLines: state.pendingSaleLines.filter(
            l => !(l.offlineId === offlineId && l.idCategory === idCategory && l.qty === qty)
          )
        })),

      clearAll: () => set({ pendingSales: [], pendingSaleLines: [] })
    }),
    {
      name: 'artesan-guapinol-offline-sales',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
