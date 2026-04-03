import {
  View,
  Text,
  Pressable,
  StatusBar,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavProp } from "../../types/navigation";
import { useNavigation } from "@react-navigation/native";
import SettingsIcon from "../../assets/icons/settings.svg";
import FileDownloadIcon from "../../assets/icons/file-down.svg";
import { Colors } from "../../constants/theme";
import MonthlyCalendar from "./components/MonthlyCalendar";
import { useState, useMemo } from "react";
import { useLogStore } from "../../store/logsStore";
import { useMedicationStore } from "../../store/medicationStore";

const LogsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthLabel, setCurrentMonthLabel] = useState(
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  );
  const { getLogsByDate, logs } = useLogStore();
  const { medications } = useMedicationStore();

  const dayLogs = useMemo(() => {
    const logList = getLogsByDate(selectedDate);

    return logList
      .map((log) => {
        const medication = medications.find((m) => m.id === log.medicationId);
        return {
          ...log,
          medicationName: medication?.name || "Bilinmeyen İlaç",
          form: medication?.form,
        };
      })
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [selectedDate, logs, medications]);

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

  const getStatusInfo = (log: (typeof dayLogs)[0]) => {
    const now = new Date();
    if (log.takenAt) {
      return {
        icon: "✓",
        label: "Taken",
        color: Colors.success || "#22C55E",
        subtext: `${log.takenAt.getHours().toString().padStart(2, "0")}:${log.takenAt.getMinutes().toString().padStart(2, "0")}`,
      };
    }
    if (log.skipped) {
      return {
        icon: "−",
        label: "Skipped",
        color: Colors.textSecondary,
        subtext: "Intentionally skipped",
      };
    }
    const scheduledDateTime = new Date(
      `${log.scheduledDate}T${log.scheduledTime}`,
    );
    if (scheduledDateTime < now) {
      return {
        icon: "✗",
        label: "Missed",
        color: Colors.error || "#EF4444",
        subtext: "Not taken in time",
      };
    }
    return {
      icon: "○",
      label: "Pending",
      color: Colors.textSecondary,
      subtext: "It's not time yet",
    };
  };

  const handleExport = () => {
    console.log("Export logs");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --------------------------------- Header --------------------------------- */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={handleExport}>
          <FileDownloadIcon
            height={24}
            width={24}
            stroke={Colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerText}>{currentMonthLabel}</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate("Settings", { screen: "SettingsMain" })
          }
        >
          <SettingsIcon height={24} width={24} stroke={Colors.textPrimary} />
        </Pressable>
      </View>

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
        <View style={styles.detailHeader}>
          <Text style={styles.detailDate}>
            {formatSelectedDate(selectedDate)}
          </Text>
          {dayStats.hasLogs && (
            <View
              style={[
                styles.adherenceBadge,
                {
                  backgroundColor:
                    dayStats.adherenceRate === 100
                      ? Colors.success
                      : dayStats.adherenceRate > 0
                        ? Colors.warning
                        : Colors.error,
                },
              ]}
            >
              <Text style={styles.adherenceText}>
                %{dayStats.adherenceRate}
              </Text>
            </View>
          )}
        </View>

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
            dayLogs.map((log) => {
              const status = getStatusInfo(log);
              // Medication Log Card
              return (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logLeft}>
                    <Text style={styles.logTime}>{log.scheduledTime}</Text>
                    <View style={styles.timeline} />
                  </View>

                  <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                      <View>
                        <Text style={styles.medicationName}>
                          {log.medicationName}
                        </Text>
                        {log.doseTaken && (
                          <Text style={styles.doseText}>{log.doseTaken}</Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: status.color + "20" },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: status.color }]}
                        >
                          {status.icon}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.statusLabel}>
                      {status.label} • {status.subtext}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LogsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.textPrimary,
  },
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
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },
  adherenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adherenceText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "600",
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
  logItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  logLeft: {
    width: 50,
    alignItems: "center",
  },
  logTime: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border || "#E5E5E5",
    borderRadius: 1,
  },
  logContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  doseText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
