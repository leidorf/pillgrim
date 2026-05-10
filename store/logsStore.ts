import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogFilter, MedicationLog } from "../types/medication";
import * as Crypto from "expo-crypto";
import { useMedicationStore } from "./medicationStore";
import { getLocalDateString } from "../utils/dateUtils";

type LogStore = {
  logs: MedicationLog[];
  addLog: (log: Omit<MedicationLog, "id">) => void;
  updateLog: (id: string, updates: Partial<MedicationLog>) => void;
  deleteLog: (id: string) => void;
  deleteLogsByMedication: (id: string) => void;
  getLogsByDate: (date: Date) => MedicationLog[];
  getLogsByDateRange: (startDate: Date, endDate: Date) => MedicationLog[];
  getLogsByMedication: (medicationId: string) => MedicationLog[];
  getDayStats: (date: Date) => {
    hasLogs: boolean;
    adherenceRate: number;
    totalMeds: number;
    takenMeds: number;
    skippedMeds: number;
  };
  getFilteredLogs: (filter: LogFilter) => MedicationLog[];
};

export const useLogStore = create<LogStore>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) => {
        const newLog: MedicationLog = {
          ...log,
          id: Crypto.randomUUID(),
        };
        set((state) => ({ logs: [...state.logs, newLog] }));

        /* ----------------------------- Decrease Stock ----------------------------- */
        if (newLog.takenAt && !newLog.skipped && newLog.doseAmount) {
          useMedicationStore
            .getState()
            .updateStock(newLog.medicationId, -newLog.doseAmount);
        }
      },

      updateLog: (id, updates) => {
        const oldLog = get().logs.find((l) => l.id === id);
        if (!oldLog) return;

        const safeUpdates = {
          ...updates,
          takenAt: updates.takenAt
            ? new Date(updates.takenAt)
            : updates.takenAt,
        };

        const mergedLog = { ...oldLog, ...safeUpdates };
        const doseAmount = mergedLog.doseAmount;

        set((state) => ({
          logs: state.logs.map((log) => (log.id === id ? mergedLog : log)),
        }));

        const wasTaken = !!oldLog.takenAt && !oldLog.skipped;
        const isTaken = !!mergedLog.takenAt && !mergedLog.skipped;

        if (wasTaken !== isTaken && doseAmount) {
          const delta = isTaken ? -doseAmount : doseAmount;
          useMedicationStore.getState().updateStock(oldLog.medicationId, delta);
        }
      },

      deleteLog: (id) => {
        const log = get().logs.find((l) => l.id === id);

        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        }));

        if (log?.takenAt && !log.skipped && log.doseAmount) {
          useMedicationStore
            .getState()
            .updateStock(log.medicationId, log.doseAmount);
        }
      },

      deleteLogsByMedication: (medicationId: string) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.medicationId !== medicationId),
        }));
      },

      getLogsByDate: (date) => {
        const dateStr = getLocalDateString(date);
        return get().logs.filter((log) => log.scheduledDate === dateStr);
      },

      getLogsByDateRange: (startDate, endDate) => {
        const startStr = getLocalDateString(startDate);
        const endStr = getLocalDateString(endDate);
        return get().logs.filter(
          (log) => log.scheduledDate >= startStr && log.scheduledDate <= endStr,
        );
      },

      getLogsByMedication: (medicationId) => {
        return get().logs.filter((log) => log.medicationId === medicationId);
      },

      getDayStats: (date) => {
        const dayLogs = get().getLogsByDate(date);
        const totalMeds = dayLogs.length;

        if (totalMeds === 0) {
          return {
            hasLogs: false,
            adherenceRate: 0,
            totalMeds: 0,
            takenMeds: 0,
            skippedMeds: 0,
          };
        }

        const takenMeds = dayLogs.filter(
          (log) => log.takenAt && !log.skipped,
        ).length;
        const skippedMeds = dayLogs.filter((log) => log.skipped).length;
        const applicableMeds = totalMeds - skippedMeds;
        const adherenceRate =
          applicableMeds > 0
            ? Math.round((takenMeds / applicableMeds) * 100)
            : 100;

        return {
          hasLogs: true,
          adherenceRate,
          totalMeds,
          takenMeds,
          skippedMeds,
        };
      },

      getFilteredLogs: (filter: LogFilter) => {
        const { startDate, endDate, medicationId, status } = filter;
        return get().logs.filter((log) => {
          if (log.scheduledDate < startDate || log.scheduledDate > endDate)
            return false;
          if (medicationId && log.medicationId !== medicationId) return false;
          if (!status || status === "all") return true;

          const now = new Date();
          const scheduledDateTime = new Date(
            `${log.scheduledDate}T${log.scheduledTime}`,
          );

          switch (status) {
            case "taken":
              return !!log.takenAt && !log.skipped;
            case "skipped":
              return !!log.skipped;
            case "missed":
              return !log.takenAt && !log.skipped && scheduledDateTime < now;
            case "pending":
              return !log.takenAt && !log.skipped && scheduledDateTime >= now;
            default:
              return true;
          }
        });
      },
    }),
    {
      name: "logs-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ logs: state.logs }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.logs = state.logs.map((log) => ({
          ...log,
          takenAt: log.takenAt ? new Date(log.takenAt) : undefined,
        }));
      },
    },
  ),
);
