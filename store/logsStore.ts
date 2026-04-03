import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MedicationLog } from "../types/medication";
import * as Crypto from "expo-crypto";

type LogStore = {
  logs: MedicationLog[];
  addLog: (log: Omit<MedicationLog, "id">) => void;
  updateLog: (id: string, updates: Partial<MedicationLog>) => void;
  deleteLog: (id: string) => void;
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
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, ...updates } : log,
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        }));
      },

      getLogsByDate: (date) => {
        const dateStr = date.toISOString().split("T")[0];
        return get().logs.filter((log) => log.scheduledDate === dateStr);
      },

      getLogsByDateRange: (startDate, endDate) => {
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];
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
    }),
    {
      name: "logs-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ logs: state.logs }),
    },
  ),
);
