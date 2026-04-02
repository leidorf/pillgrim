import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../../components/AddMedicationButton";
import MedicationCard from "./components/MedicationCard";
import WeeklyCalendar from "./components/WeeklyCalendar";
import { useState } from "react";
import { Medication, MedicationLog } from "../../types/medication";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import { useMedicationStore } from "../../store/medicationStore";

type LogsMap = Record<string, MedicationLog>;

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
  const [logs, setLogs] = useState<LogsMap>({});

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

  const hasMedsOnDate = (date: Date): boolean => {
    return getScheduleForDate(date).length > 0;
  };

  const handleToggle = (medicationId: string, time: string) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const logKey = `${medicationId}-${dateStr}-${time}`;
    setLogs((prev) => {
      const existing = prev[logKey];
      if (existing?.takenAt && !existing?.skipped) {
        const { [logKey]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [logKey]: {
          id: Date.now().toString(),
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          takenAt: new Date(),
          skipped: false,
        },
      };
    });
  };

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
        renderItem={({ item }) => (
          <MedicationCard
            medication={item.medication}
            time={item.time}
            dose={item.dose}
            log={logs[item.logKey]}
            onToggle={handleToggle}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>No medications for today!</Text>
            <Text style={styles.emptySubtext}>
              {selectedDate.toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
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
  emptySubtext: { fontSize: 14, color: "#666", textTransform: "capitalize" },
});

export default HomeScreen;