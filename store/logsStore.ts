import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogFilter, MedicationLog } from "../types/medication";
import * as Crypto from "expo-crypto";
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

        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, ...safeUpdates } : log,
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        }));
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
          (log) =>
            log.scheduledDate >= startStr && log.scheduledDate <= endStr,
        );
      },

      getLogsByMedication: (medicationId) => {
        return get().logs.filter((log) => log.medicationId === medicationId);
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