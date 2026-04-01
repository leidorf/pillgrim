import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../../components/AddMedicationButton";
import MedicationCard from "./components/MedicationCard";
import { useState } from "react";
import { Medication, MedicationLog } from "../../types/medication";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import { useMedicationStore } from "../../store/medicationStore";

type LogsMap = Record<string, MedicationLog>;

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
  const [logs, setLogs] = useState<LogsMap>({});
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayDayOfMonth = today.getDate();
  const todayWeekday = WEEKDAY_MAP[today.getDay()];

  const isMedicationScheduledForToday = (med: Medication): boolean => {
    if (!med.schedule || !med.isActive) return false;
    const { type, days, interval, startDate } = med.schedule;

    switch (type) {
      case "daily":
        return true;
      case "weekly":
        return days?.includes(todayWeekday) ?? false;
      case "biweekly":
        if (!startDate) return false;
        const start = new Date(startDate);
        const diffDays = Math.floor(
          (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays >= 0 && diffDays % 14 === 0;
      case "monthly":
        if (!startDate) return false;
        return todayDayOfMonth === new Date(startDate).getDate();
      case "specificmonth":
        return days?.includes(todayDayOfMonth) ?? false;
      case "interval":
        if (!interval || !startDate) return false;
        const intervalDiff = Math.floor(
          (today.getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return intervalDiff >= 0 && intervalDiff % interval === 0;
      case "prn":
        return false;
      default:
        return false;
    }
  };

  const getTodaySchedule = () => {
    const schedule: Array<{
      medication: Medication;
      time: string;
      dose: string;
      logKey: string;
    }> = [];

    medications.forEach((med) => {
      if (!isMedicationScheduledForToday(med)) return;
      if (!med.timeDoses || med.timeDoses.length === 0) return;

      med.timeDoses.forEach((td) => {
        schedule.push({
          medication: med,
          time: td.time,
          dose: td.dose,
          logKey: `${med.id}-${todayStr}-${td.time}`,
        });
      });
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleToggle = (medicationId: string, time: string) => {
    const logKey = `${medicationId}-${todayStr}-${time}`;
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
          scheduledDate: todayStr,
          scheduledTime: time,
          takenAt: new Date(),
          skipped: false,
        },
      };
    });
  };

  const todaySchedule = getTodaySchedule();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateDay}>{today.getDate()}</Text>
          <View>
            <Text style={styles.dateWeekday}>
              {today.toLocaleDateString("tr-TR", { weekday: "long" })}
            </Text>
            <Text style={styles.dateMonth}>
              {today.toLocaleDateString("tr-TR", {
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.medList}
        contentContainerStyle={styles.listContent}
        data={todaySchedule}
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
              {today.toLocaleDateString("tr-TR", {
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
  box: {
    height: 240,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  dateHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateDay: { fontSize: 64, fontWeight: "300", color: "#000", lineHeight: 64 },
  dateWeekday: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    textTransform: "capitalize",
  },
  dateMonth: { fontSize: 14, color: "#666", textTransform: "capitalize" },
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
