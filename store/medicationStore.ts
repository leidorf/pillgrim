import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Medication } from "../types/medication";
import * as Crypto from "expo-crypto";

type DraftMedication = Partial<Medication>;

type MedicationStore = {
  medications: Medication[];
  draft: DraftMedication;
  setDraft: (fields: Partial<Medication>) => void;
  clearDraft: () => void;
  saveMedication: () => void;
  deleteMedication: (id: string) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
};

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      draft: {},
      setDraft: (fields) =>
        set((state) => ({ draft: { ...state.draft, ...fields } })),
      clearDraft: () => set({ draft: {} }),
      saveMedication: () => {
        const { draft, medications } = get();
        if (!draft.name) {
          console.warn("Cannot save medication without a name");
          return;
        }
        const now = new Date().toISOString();
        const newMed: Medication = {
          id: Crypto.randomUUID(),
          name: draft.name.trim(),
          form: draft.form,
          schedule: draft.schedule,
          timeDoses: draft.timeDoses ?? [],
          note: draft.note,
          stock: draft.stock,
          photoUri: draft.photoUri,
          isActive: true,
          notificationSettings: draft.notificationSettings ?? {
            enabled: true,
            hideName: false,
            lowStockAlert: draft.stock !== undefined,
          },
          createdAt: now,
          updatedAt: now,
        };
        set({ medications: [...medications, newMed], draft: {} });
      },
      deleteMedication: (id: string) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));
      },
      updateMedication: (id: string, updates: Partial<Medication>) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id
              ? { ...m, ...updates, updatedAt: new Date().toISOString() }
              : m,
          ),
        }));
      },
    }),
    {
      name: "medications-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ medications: state.medications }),
    },
  ),
);
