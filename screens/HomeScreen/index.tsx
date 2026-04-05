import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../../components/AddMedicationButton";
import MedicationCard from "./components/MedicationCard";
import WeeklyCalendar from "./components/WeeklyCalendar";
import { useCallback, useMemo, useRef, useState } from "react";
import { Medication, MedicationLog } from "../../types/medication";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import { useMedicationStore } from "../../store/medicationStore";
import { Colors } from "../../constants/theme";
import { useLogStore } from "../../store/logsStore";
import BottomSheet from "@gorhom/bottom-sheet";
import MedicationActionSheet from "./components/ActionBottomSheet";

type ScheduleItem = {
  medication: Medication;
  time: string;
  dose: string;
  logKey: string;
};

const WEEKDAY_MAP: Record<number, number> = {
  0: 7,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

const HomeScreen = () => {
  const { medications } = useMedicationStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logs, addLog, updateLog, deleteLog, getLogsByDate } = useLogStore();

  const actionSheetRef = useRef<BottomSheet>(null);
  const [selectedItem, setSelectedItem] = useState<{
    medication: Medication;
    time: string;
    log?: MedicationLog;
  } | null>(null);

  const isMedicationScheduledForDate = (
    med: Medication,
    date: Date,
    dayOfMonth: number,
    weekday: number,
  ): boolean => {
    if (!med.schedule || !med.isActive) return false;
    const { type, days, interval, startDate } = med.schedule;

    switch (type) {
      case "daily":
        return true;
      case "weekly":
        return days?.includes(weekday) ?? false;
      case "biweekly": {
        if (!startDate) return false;
        const start = new Date(startDate);
        const diffDays = Math.floor(
          (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays >= 0 && diffDays % 14 === 0;
      }
      case "monthly":
        if (!startDate) return false;
        return dayOfMonth === new Date(startDate).getDate();
      case "specificmonth":
        return days?.includes(dayOfMonth) ?? false;
      case "interval": {
        if (!interval || !startDate) return false;
        const intervalDiff = Math.floor(
          (date.getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return intervalDiff >= 0 && intervalDiff % interval === 0;
      }
      case "prn":
        return false;
      default:
        return false;
    }
  };

  const getScheduleForDate = (date: Date): ScheduleItem[] => {
    const dateStr = date.toISOString().split("T")[0];
    const dayOfMonth = date.getDate();
    const weekday = WEEKDAY_MAP[date.getDay()];
    const schedule: ScheduleItem[] = [];

    medications.forEach((med) => {
      if (!isMedicationScheduledForDate(med, date, dayOfMonth, weekday)) return;
      if (!med.timeDoses || med.timeDoses.length === 0) return;

      med.timeDoses.forEach((td) => {
        schedule.push({
          medication: med,
          time: td.time,
          dose: td.dose,
          logKey: `${med.id}-${dateStr}-${td.time}`,
        });
      });
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const hasMedsOnDate = useCallback(
    (date: Date) => getScheduleForDate(date).length > 0,
    [medications],
  );

  const dayLogs = useMemo(() => {
    return getLogsByDate(selectedDate);
  }, [selectedDate, logs]);

  const handleOpenSheet = useCallback(
    (medication: Medication, time: string, log?: MedicationLog) => {
      setSelectedItem({ medication, time, log });
      actionSheetRef.current?.expand();
    },
    [],
  );

  const handleToggle = useCallback(
    (medicationId: string, time: string) => {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const existingLog = dayLogs.find(
        (l) => l.medicationId === medicationId && l.scheduledTime === time,
      );
      if (existingLog) {
        if (existingLog.takenAt && !existingLog.skipped) {
          deleteLog(existingLog.id);
        } else {
          updateLog(existingLog.id, { takenAt: new Date(), skipped: false });
        }
      } else {
        addLog({
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          takenAt: new Date(),
          skipped: false,
        });
      }
    },
    [selectedDate, dayLogs, deleteLog, updateLog, addLog],
  );

  const handleSkip = useCallback(
    (medicationId: string, time: string) => {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const existingLog = dayLogs.find(
        (l) => l.medicationId === medicationId && l.scheduledTime === time,
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
    [selectedDate, dayLogs, deleteLog, updateLog, addLog],
  );

  const handleSnooze = useCallback(
    (medicationId: string, time: string, minutes: number) => {
      // TODO: expo-notifications
      console.log(`Snooze ${medicationId} at ${time} for ${minutes} min`);
    },
    [],
  );

  const selectedLog = selectedItem
    ? dayLogs.find(
        (l) =>
          l.medicationId === selectedItem.medication.id &&
          l.scheduledTime === selectedItem.time,
      )
    : undefined;

  const schedule = getScheduleForDate(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
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
        renderItem={({ item }) => {
          const log = dayLogs.find(
            (l) =>
              l.medicationId === item.medication.id &&
              l.scheduledTime === item.time,
          );
          return (
            <MedicationCard
              medication={item.medication}
              time={item.time}
              dose={item.dose}
              log={log}
              onToggle={handleToggle}
              onOpenSheet={handleOpenSheet}
            />
          );
        }}
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
      <AddMedicationButton />

      <MedicationActionSheet
        ref={actionSheetRef}
        medicationName={selectedItem?.medication.name ?? ""}
        time={selectedItem?.time ?? ""}
        isTaken={!!selectedLog?.takenAt && !selectedLog?.skipped}
        isSkipped={!!selectedLog?.skipped}
        onTaken={() =>
          selectedItem &&
          handleToggle(selectedItem.medication.id, selectedItem.time)
        }
        onSkip={() =>
          selectedItem &&
          handleSkip(selectedItem.medication.id, selectedItem.time)
        }
        onSnooze={(minutes) =>
          selectedItem &&
          handleSnooze(selectedItem.medication.id, selectedItem.time, minutes)
        }
      />

      <AddMedicationButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: StatusBar.currentHeight },
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
