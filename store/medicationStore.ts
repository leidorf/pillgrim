import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Medication } from "../types/medication";
import * as Crypto from "expo-crypto";
import { useLogStore } from "./logsStore";
import {
  scheduleMedicationNotifications,
  cancelMedicationNotifications,
  rescheduleMedicationNotifications,
} from "../services/notificationService";

type DraftMedication = Partial<Medication>;

type MedicationStore = {
  medications: Medication[];
  draft: DraftMedication;
  setDraft: (fields: Partial<Medication>) => void;
  clearDraft: () => void;
  saveMedication: () => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  updateStock: (id: string, delta: number) => void;
  _updateMedicationNotificationIds: (
    id: string,
    notificationIds: string[],
  ) => void;
};

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      draft: {},
      /* -------------------------------- Set Draft ------------------------------- */
      setDraft: (fields) =>
        set((state) => ({ draft: { ...state.draft, ...fields } })),

      /* ------------------------------- Clear Draft ------------------------------ */
      clearDraft: () => set({ draft: {} }),

      /* ----------------------------- Save Medication ---------------------------- */
      saveMedication: async () => {
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
          notificationIds: [],
        };

        set({ medications: [...medications, newMed], draft: {} });

        try {
          const notificationIds = await scheduleMedicationNotifications(newMed);
          // TODO: development log - remove before publish
          console.log("Scheduled IDs:", notificationIds);
          set((state) => ({
            medications: state.medications.map((m) =>
              m.id === newMed.id ? { ...m, notificationIds } : m,
            ),
          }));
        } catch (error) {
          console.error("Failed to schedule notifications:", error);
        }
      },

      /* ---------------------------- Delete Medication --------------------------- */
      deleteMedication: async (id: string) => {
        const medication = get().medications.find((m) => m.id === id);
        if (medication?.notificationIds?.length) {
          try {
            await cancelMedicationNotifications(medication.notificationIds);
          } catch (error) {
            console.error("Failed to cancel notifications: ", error);
          }
        }

        useLogStore.getState().deleteLogsByMedication(id);

        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));
      },

      /* ---------------------------- Update Medication --------------------------- */
      updateMedication: async (id: string, updates: Partial<Medication>) => {
        const currentMed = get().medications.find((m) => m.id === id);
        if (!currentMed) {
          console.warn("Medication not found:", id);
          return;
        }

        const updatedMed: Medication = {
          ...currentMed,
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
        };

        const needsReschedule =
          updates.notificationSettings !== undefined ||
          updates.schedule !== undefined ||
          updates.timeDoses !== undefined ||
          updates.isActive !== undefined;

        let newNotificationIds: string[] = currentMed.notificationIds ?? [];

        if (needsReschedule) {
          try {
            newNotificationIds = await rescheduleMedicationNotifications(
              updatedMed,
              currentMed.notificationIds ?? [],
            );
          } catch (error) {
            console.error("Failed to reschedule notifications:", error);
          }
        }

        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id
              ? { ...updatedMed, notificationIds: newNotificationIds }
              : m,
          ),
        }));

        //TODO: lowstock notification
        if (updates.stock !== undefined && updates.stock <= 5) {
        }
      },

      /* -------------------- Update Stock on Medication Takes -------------------- */
      updateStock: (id: string, delta: number) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id && m.stock !== undefined
              ? {
                  ...m,
                  stock: Math.max(0, m.stock + delta),
                  updatedAt: new Date().toISOString(),
                }
              : m,
          ),
        }));
      },

      _updateMedicationNotificationIds: (
        id: string,
        notificationIds: string[],
      ) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, notificationIds } : m,
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
