import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../../constants/theme";
import MonthlyCalendar from "./components/MonthlyCalendar";
import { useState, useMemo } from "react";
import { useLogStore } from "../../store/logsStore";
import { useMedicationStore } from "../../store/medicationStore";
import ScreenLayout from "../../components/ScreenLayout";
import LogsHeader from "./components/LogsHeader";
import SelectedDayHeader from "./components/SelectedDayHeader";
import MedicationLogCard from "./components/MedicationLogCard";
import { useTimeFormat } from "../../hooks/useTimeFormat";

const LogsScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthLabel, setCurrentMonthLabel] = useState(
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  );
  const { getLogsByDate, logs } = useLogStore();
  const { medications } = useMedicationStore();
  const { formatTimeString } = useTimeFormat();

  const dayLogs = useMemo(() => {
    const logList = getLogsByDate(selectedDate);

    return logList
      .map((log) => {
        const medication = medications.find((m) => m.id === log.medicationId);
        return {
          ...log,
          medicationName: medication?.name || "Unknown Medication",
          form: medication?.form,
          displayTime: formatTimeString(log.scheduledTime),
        };
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [selectedDate, logs, medications, formatTimeString]);

  const getDayStats = useLogStore((state) => state.getDayStats);
  const dayStats = useMemo(() => {
    return getDayStats(selectedDate);
  }, [selectedDate, logs]);

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <ScreenLayout>
      {/* --------------------------------- Header --------------------------------- */}
      <LogsHeader headerText={currentMonthLabel} />

      {/* ---------------------------- Monthly Calendar ---------------------------- */}
      <View style={styles.calendarContainer}>
        <MonthlyCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={setCurrentMonthLabel}
        />
      </View>

      {/* ------------------------------ Selected Day ------------------------------ */}
      <View style={styles.detailContainer}>
        {/* --------------------------- Selected Day Header -------------------------- */}
        <SelectedDayHeader
          hasLogs={dayStats.hasLogs}
          selectedDate={formatSelectedDate(selectedDate)}
          adherenceRate={dayStats.adherenceRate}
        />

        <ScrollView
          style={styles.logsList}
          contentContainerStyle={styles.logsListContent}
          showsVerticalScrollIndicator={false}
        >
          {!dayStats.hasLogs ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No logs found</Text>
              <Text style={styles.emptySubtext}>
                The days your medications are scheduled for will appear here
              </Text>
            </View>
          ) : (
            dayLogs.map((log) => (
              /* --------------------------- Medication Log Card -------------------------- */
              <MedicationLogCard key={log.id} log={log} />
            ))
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

export default LogsScreen;

const styles = StyleSheet.create({
  calendarContainer: {
    height: 380,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#e0ead6",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  logsList: {
    flex: 1,
  },
  logsListContent: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
