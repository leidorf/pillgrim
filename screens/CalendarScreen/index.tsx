import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "../../components/Text";
import { useState, useMemo, useEffect } from "react";
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
import ExportModal from "./components/ExportModal";
import { exportCSV } from "../../services/csvExport";
import { exportPDF } from "../../services/pdfExport";
import { MonthRange, normalizeMonthRange } from "../../utils/monthRange";
import { ExportKind } from "../../utils/exportFormatting";

import {
  buildDailySchedule,
  buildScheduleForDateRange,
  computeDayStats,
  WeekdayMap,
} from "../../utils/medicationScheduleUtils";
import { WeekStart } from "../../types/schedule";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";
import { responsiveScale } from "../../utils/responsive";

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
  const now = new Date();
  const [currentMonthLabel, setCurrentMonthLabel] = useState(
    now.toLocaleDateString(locale, { month: "long", year: "numeric" }),
  );
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    setCurrentMonthLabel(
      firstOfMonth.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      }),
    );
  }, [locale]);

  const { logs } = useLogStore();
  const { medications } = useMedicationStore();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const { formatTimeString, timeFormat } = useTimeFormat();

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
        scheduleType: entry.scheduleType,
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

  const runExport = async (kind: ExportKind, range: MonthRange) => {
    setIsExporting(true);
    try {
      const { from, to } = normalizeMonthRange(range);
      const scheduleMap = buildScheduleForDateRange(
        medications,
        logs,
        new Date(from.year, from.month, 1),
        new Date(to.year, to.month + 1, 0),
        weekdayMap,
        formatTimeString,
      );
      if (kind === "csv") {
        await exportCSV({ scheduleMap, range, timeFormat, t });
      } else {
        await exportPDF({
          scheduleMap,
          medications,
          range,
          weekdayMap,
          timeFormat,
          t,
          locale,
        });
      }
    } catch (error) {
      console.warn("Export failed", error);
    } finally {
      setIsExporting(false);
      setExportModalVisible(false);
    }
  };

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenLayout>
      {/* --------------------------------- Header --------------------------------- */}
      <LogsHeader
        headerText={currentMonthLabel}
        onExportPress={() => setExportModalVisible(true)}
      />
      <ScrollView
        style={styles.logsList}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------- Monthly Calendar ---------------------------- */}
        <View style={styles.calendarContainer}>
          <MonthlyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={(label, year, month) => {
              setCurrentMonthLabel(label);
              setCurrentYear(year);
              setCurrentMonth(month);
            }}
          />
        </View>

        {/* ------------------------------ Selected Day ------------------------------ */}
        <View style={styles.detailContainer}>
          <SelectedDayHeader selectedDate={formatSelectedDate(selectedDate)} />
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
        </View>
      </ScrollView>

      {/* ----------------------------- Export Modal ----------------------------- */}
      <ExportModal
        visible={exportModalVisible}
        defaultYear={currentYear}
        defaultMonth={currentMonth}
        busy={isExporting}
        onClose={() => setExportModalVisible(false)}
        onExport={runExport}
      />
    </ScreenLayout>
  );
};

export default CalendarScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    calendarContainer: {
      height: responsiveScale.number(320),
      marginBottom: responsiveScale.number(12),
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
    emptyState: {
      flex: 1,
      minHeight: 120,
      alignItems: "center",
      justifyContent: "center",
      gap: responsiveScale.number(12),
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
