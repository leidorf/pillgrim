import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";
import MedicationCard from "../components/MedicationCard";
import { useState } from "react";
import { MedicationLog } from "../types/medication";
import PillBottleIcon from "../assets/icons/pill-bottle.svg";
import { useMedicationStore } from "../store/medicationStore";

type LogsMap = Record<string, MedicationLog>;

const HomeScreen = () => {
  const { medications } = useMedicationStore();

  const [logs, setLogs] = useState<LogsMap>({});

  const getTodaySchedule = () => {
    const today = new Date().toISOString().split("T")[0];
    const schedule: Array<{
      medication: (typeof medications)[0];
      time: string;
      logKey: string;
    }> = [];

    medications.forEach((med) => {
      if (!med.isActive || !med.times) return;

      med.times.forEach((time) => {
        schedule.push({
          medication: med,
          time,
          logKey: `${med.id}-${today}-${time}`,
        });
      });
    });

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleToggle = (medicationId: string, time: string) => {
    const today = new Date().toISOString().split("T")[0];
    const logKey = `${medicationId}-${today}-${time}`;

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
          scheduledDate: today,
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
      <View style={styles.box}></View>
      <FlatList
        style={styles.medList}
        contentContainerStyle={styles.listContent}
        data={todaySchedule}
        keyExtractor={(item) => item.logKey}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item.medication}
            time={item.time}
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
          </View>
        }
      />
      <AddMedicationButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  medList: {
    paddingHorizontal: 32,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#e0ead6",
  },
  listContent: {
    paddingBottom: 72,
  },
  box: {
    height: 240,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default HomeScreen;
