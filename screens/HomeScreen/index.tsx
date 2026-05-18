import { FlatList, StyleSheet, Text, View } from "react-native";
import AddMedicationButton from "../../components/AddMedicationButton";
import MedicationCard from "./components/MedicationCard";
import WeeklyCalendar from "./components/WeeklyCalendar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Medication, MedicationLog } from "../../types/medication";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import { useMedicationStore } from "../../store/medicationStore";
import { Colors } from "../../constants/theme";
import { useLogStore } from "../../store/logsStore";
import BottomSheet from "@gorhom/bottom-sheet";
import MedicationActionSheet from "./components/MedicationActionSheet";
import ScreenLayout from "../../components/ScreenLayout";
import { useTimeFormat } from "../../hooks/useTimeFormat";
import { getLocalDateString } from "../../utils/dateUtils";
import { useSettingsStore } from "../../store/settingsStore";
import { WeekStart } from "../../types/schedule";
import { snoozeMedicationNotification } from "../../services/notificationService";
import {
  buildDailySchedule,
  isMedicationScheduledForDate,
  WeekdayMap,
} from "../../utils/medicationScheduleUtils";

const buildWeekdayMap = (weekStartsOn: WeekStart): WeekdayMap => {
  const map: WeekdayMap = {};
  for (let i = 0; i < 7; i++) {
    map[(weekStartsOn + i) % 7] = i + 1;
  }
  return map;
};

const HomeScreen = () => {
  const { medications } = useMedicationStore();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const weekdayMap = useMemo(
    () => buildWeekdayMap(weekStartsOn),
    [weekStartsOn],
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logs, addLog, updateLog, deleteLog } = useLogStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const actionSheetRef = useRef<BottomSheet>(null);
  const { formatTimeString } = useTimeFormat();

  const [selectedItem, setSelectedItem] = useState<{
    medication: Medication;
    time: string;
    log?: MedicationLog;
  } | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const schedule = useMemo(
    () =>
      buildDailySchedule(
        medications,
        logs,
        selectedDate,
        weekdayMap,
        formatTimeString,
        now,
      ),
    [medications, logs, selectedDate, weekdayMap, formatTimeString, now],
  );

  const hasMedsOnDate = useCallback(
    (date: Date) =>
      medications.some((med) =>
        isMedicationScheduledForDate(med, date, weekdayMap),
      ),
    [medications, weekdayMap],
  );

  const selectedLog = useMemo(() => {
    if (!selectedItem) return undefined;
    return logs.find(
      (l) =>
        l.medicationId === selectedItem.medication.id &&
        l.scheduledTime === selectedItem.time &&
        l.scheduledDate === getLocalDateString(selectedDate),
    );
  }, [selectedItem, logs, selectedDate]);

  const handleOpenSheet = useCallback(
    (medication: Medication, time: string, log?: MedicationLog) => {
      setSelectedItem({ medication, time, log });
      actionSheetRef.current?.expand();
    },
    [],
  );

  const handleToggle = useCallback(
    (medicationId: string, time: string, doseAmount?: number) => {
      const dateStr = getLocalDateString(selectedDate);
      const existingLog = logs.find(
        (l) =>
          l.medicationId === medicationId &&
          l.scheduledTime === time &&
          l.scheduledDate === dateStr,
      );

      if (existingLog) {
        if (existingLog.takenAt && !existingLog.skipped) {
          deleteLog(existingLog.id);
        } else {
          updateLog(existingLog.id, {
            takenAt: new Date(),
            skipped: false,
            ...(doseAmount && { doseAmount }),
          });
        }
      } else {
        addLog({
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          takenAt: new Date(),
          skipped: false,
          doseAmount,
        });
      }
    },
    [selectedDate, logs, deleteLog, updateLog, addLog],
  );

  const handleSkip = useCallback(
    (medicationId: string, time: string) => {
      const dateStr = getLocalDateString(selectedDate);
      const existingLog = logs.find(
        (l) =>
          l.medicationId === medicationId &&
          l.scheduledTime === time &&
          l.scheduledDate === dateStr,
      );

      if (existingLog) {
        if (existingLog.skipped) {
          deleteLog(existingLog.id);
        } else {
          updateLog(existingLog.id, { takenAt: undefined, skipped: true });
        }
      } else {
        addLog({
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          skipped: true,
        });
      }
    },
    [selectedDate, logs, deleteLog, updateLog, addLog],
  );

  const handleSnooze = useCallback(
    async (medicationId: string, time: string, minutes: number) => {
      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;
      const doseStr = medication.timeDoses?.find(
        (td) => td.time === time,
      )?.dose;
      await snoozeMedicationNotification(medication, time, minutes, doseStr);
    },
    [medications],
  );

  return (
    <ScreenLayout>
      <WeeklyCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasMedsOnDate={hasMedsOnDate}
      />

      <FlatList
        style={styles.medList}
        contentContainerStyle={styles.listContent}
        data={schedule}
        keyExtractor={(item) => item.logKey}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item.medication}
            time={item.scheduledTime}
            displayTime={item.displayTime}
            dose={item.dose}
            log={item.log}
            isMissed={item.status === "missed"}
            onToggle={(medId, time) => {
              const amount = parseFloat(item.dose) || 1;
              handleToggle(medId, time, amount);
            }}
            onOpenSheet={handleOpenSheet}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke={Colors.textPrimary}
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>No medications for today!</Text>
            <Text style={styles.emptySubtext}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        }
      />

      {!isSheetOpen && <AddMedicationButton />}

      <MedicationActionSheet
        ref={actionSheetRef}
        medicationName={selectedItem?.medication.name ?? ""}
        displayTime={selectedItem ? formatTimeString(selectedItem.time) : ""}
        isTaken={!!selectedLog?.takenAt && !selectedLog?.skipped}
        isSkipped={!!selectedLog?.skipped}
        onTaken={() => {
          if (!selectedItem) return;
          const doseStr = selectedItem.medication.timeDoses?.find(
            (td) => td.time === selectedItem.time,
          )?.dose;
          const amount = parseFloat(doseStr || "1") || 1;
          handleToggle(selectedItem.medication.id, selectedItem.time, amount);
        }}
        onSkip={() =>
          selectedItem &&
          handleSkip(selectedItem.medication.id, selectedItem.time)
        }
        onSnooze={(minutes) =>
          selectedItem &&
          handleSnooze(selectedItem.medication.id, selectedItem.time, minutes)
        }
        onChange={(index) => setIsSheetOpen(index >= 0)}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  medList: {
    paddingHorizontal: 32,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#e0ead6",
  },
  listContent: { paddingBottom: 72 },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    gap: 8,
  },
  emptyText: { fontSize: 18, fontWeight: "500" },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
});

export default HomeScreen;
