import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Medication } from "../types/medication";
import * as Crypto from "expo-crypto";
import { useLogStore } from "./logsStore";
import {
  cancelMedicationNotifications,
  scheduleLowStockNotification,
} from "../services/notificationService";
import { logger } from "../utils/logger";

type DraftMedication = Partial<Medication>;

type MedicationStore = {
  medications: Medication[];
  draft: DraftMedication;
  _softDeleted: Medication | null;
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
  softDeleteMedication: (id: string) => void;
  undoSoftDelete: () => void;
  commitSoftDelete: () => Promise<void>;
};

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      draft: {},
      _softDeleted: null,
      /* -------------------------------- Set Draft ------------------------------- */
      setDraft: (fields) =>
        set((state) => ({ draft: { ...state.draft, ...fields } })),

      /* ------------------------------- Clear Draft ------------------------------ */
      clearDraft: () => set({ draft: {} }),

      /* ----------------------------- Save Medication ---------------------------- */
      saveMedication: async () => {
        const { draft, medications } = get();

        if (!draft.name) {
          logger.warn("Cannot save medication without a name");
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
      },

      /* ---------------------------- Delete Medication --------------------------- */
      deleteMedication: async (id: string) => {
        const medication = get().medications.find((m) => m.id === id);
        if (medication?.notificationIds?.length) {
          try {
            await cancelMedicationNotifications(medication.notificationIds);
          } catch (error) {
            logger.error("Failed to cancel notifications: ", error);
          }
        }

        useLogStore.getState().deleteLogsByMedication(id);

        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));
      },

      /* -------------------------- Soft Delete (Undo) ------------------------- */
      softDeleteMedication: (id: string) => {
        const { medications, _softDeleted } = get();

        // If another soft-delete is pending, commit it first
        if (_softDeleted) {
          const prev = _softDeleted;
          if (prev.notificationIds?.length) {
            cancelMedicationNotifications(prev.notificationIds).catch(() => {});
          }
          useLogStore.getState().deleteLogsByMedication(prev.id);
        }

        const medication = medications.find((m) => m.id === id);
        if (!medication) return;

        set({
          medications: medications.filter((m) => m.id !== id),
          _softDeleted: medication,
        });
      },

      undoSoftDelete: () => {
        const { _softDeleted, medications } = get();
        if (!_softDeleted) return;

        set({
          medications: [...medications, _softDeleted],
          _softDeleted: null,
        });
      },

      commitSoftDelete: async () => {
        const { _softDeleted } = get();
        if (!_softDeleted) return;

        if (_softDeleted.notificationIds?.length) {
          try {
            await cancelMedicationNotifications(_softDeleted.notificationIds);
          } catch (error) {
            logger.error("Failed to cancel notifications: ", error);
          }
        }

        useLogStore.getState().deleteLogsByMedication(_softDeleted.id);

        set({ _softDeleted: null });
      },

      /* ---------------------------- Update Medication --------------------------- */
      updateMedication: async (id: string, updates: Partial<Medication>) => {
        const currentMed = get().medications.find((m) => m.id === id);
        if (!currentMed) {
          logger.warn("Medication not found:", id);
          return;
        }

        const updatedMed: Medication = {
          ...currentMed,
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id
              ? {
                  ...updatedMed,
                  notificationIds: currentMed.notificationIds ?? [],
                }
              : m,
          ),
        }));

        if (
          updates.stock !== undefined &&
          updates.stock <= 5 &&
          currentMed.stock !== undefined &&
          currentMed.stock > 5 &&
          updatedMed.notificationSettings?.lowStockAlert
        ) {
          scheduleLowStockNotification(updatedMed).catch((err) =>
            logger.error("Low stock notification failed:", err),
          );
        }
      },

      /* -------------------- Update Stock on Medication Takes -------------------- */
      updateStock: (id: string, delta: number) => {
        const currentMed = get().medications.find((m) => m.id === id);
        const newStock =
          currentMed?.stock !== undefined
            ? Math.max(0, currentMed.stock + delta)
            : undefined;

        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id && m.stock !== undefined
              ? {
                  ...m,
                  stock: newStock!,
                  updatedAt: new Date().toISOString(),
                }
              : m,
          ),
        }));

        if (
          newStock !== undefined &&
          newStock <= 5 &&
          delta < 0 &&
          currentMed?.stock !== undefined &&
          currentMed.stock > 5 &&
          currentMed?.notificationSettings?.lowStockAlert
        ) {
          const updatedMed = { ...currentMed, stock: newStock };
          scheduleLowStockNotification(updatedMed).catch((err) =>
            logger.error("Low stock notification failed:", err),
          );
        }
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
