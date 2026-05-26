import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "../../components/Text";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useLogStore } from "../../store/logsStore";
import { useMedicationStore } from "../../store/medicationStore";
import { useSettingsStore } from "../../store/settingsStore";

import { useTimeFormat } from "../../hooks/useTimeFormat";

import MonthlyCalendar from "./components/MonthlyCalendar";
import ScreenLayout from "../../components/ScreenLayout";
import LogsHeader from "./components/LogsHeader";
import SelectedDayHeader from "./components/SelectedDayHeader";
import MedicationLogCard from "./components/MedicationLogCard";

import {
  buildDailySchedule,
  computeDayStats,
  WeekdayMap,
} from "../../utils/medicationScheduleUtils";
import { WeekStart } from "../../types/schedule";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const buildWeekdayMap = (weekStartsOn: WeekStart): WeekdayMap => {
  const map: WeekdayMap = {};
  for (let i = 0; i < 7; i++) {
    map[(weekStartsOn + i) % 7] = i + 1;
  }
  return map;
};

const CalendarScreen = () => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const locale = i18n.language?.split("-")[0] ?? "en";
  const [currentMonthLabel, setCurrentMonthLabel] = useState(
    new Date().toLocaleDateString(locale, { month: "long", year: "numeric" }),
  );

  const { logs } = useLogStore();
  const { medications } = useMedicationStore();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const { formatTimeString } = useTimeFormat();

  const weekdayMap = useMemo(
    () => buildWeekdayMap(weekStartsOn),
    [weekStartsOn],
  );

  const scheduleEntries = useMemo(
    () =>
      buildDailySchedule(
        medications,
        logs,
        selectedDate,
        weekdayMap,
        formatTimeString,
      ),
    [medications, logs, selectedDate, weekdayMap, formatTimeString],
  );

  const dayLogs = useMemo(
    () =>
      scheduleEntries.map((entry) => ({
        id: entry.logKey,
        scheduledDate: entry.scheduledDate,
        scheduledTime: entry.scheduledTime,
        displayTime: entry.displayTime,
        medicationName: entry.medication.name,
        form: entry.medication.form,
        doseTaken: entry.log?.doseTaken,
        takenAt: entry.log?.takenAt,
        skipped: entry.log?.skipped,
      })),
    [scheduleEntries],
  );

  const dayStats = useMemo(
    () => computeDayStats(scheduleEntries),
    [scheduleEntries],
  );

  const formatSelectedDate = (date: Date) =>
    date.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        <SelectedDayHeader selectedDate={formatSelectedDate(selectedDate)} />

        <ScrollView
          style={styles.logsList}
          contentContainerStyle={styles.logsListContent}
          showsVerticalScrollIndicator={false}
        >
          {!dayStats.hasSchedule ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t("calendar.emptyText")}</Text>
              <Text style={styles.emptySubtext}>
                {t("calendar.emptySubtext")}
              </Text>
            </View>
          ) : (
            dayLogs.map((log) => <MedicationLogCard key={log.id} log={log} />)
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

export default CalendarScreen;

const createStyles = (theme: Theme) => StyleSheet.create({
  calendarContainer: {
    height: 380,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: theme.surface,
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
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },
});
