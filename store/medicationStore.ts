import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Medication } from "../types/medication";

type DraftMedication = Partial<Medication>;

type MedicationStore = {
  medications: Medication[];

  draft: DraftMedication;
  setDraft: (fields: Partial<Medication>) => void;
  clearDraft: () => void;

  saveMedication: () => void;
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
        const newMed: Medication = {
          ...draft,
          name: draft.name,
          id: Date.now().toString(),
          isActive: true,
          isTaken: false,
        };
        set({ medications: [...medications, newMed], draft: {} });
      },
    }),
    {
      name: "medications-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ medications: state.medications }),
    },
  ),
);
