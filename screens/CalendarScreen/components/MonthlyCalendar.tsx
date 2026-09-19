import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Text } from "../../../components/Text";
import { useRef, useMemo, useCallback } from "react";
import { useLogStore } from "../../../store/logsStore";
import { useSettingsStore } from "../../../store/settingsStore";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";
import { useTranslation } from "react-i18next";
import { useMedicationStore } from "../../../store/medicationStore";
import { useTimeFormat } from "../../../hooks/useTimeFormat";
import { buildScheduleForDateRange } from "../../../utils/medicationScheduleUtils";
import { getLocalDateString } from "../../../utils/dateUtils";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (monthLabel: string, year: number, month: number) => void;
};

type MonthGridProps = {
  year: number;
  month: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  width: number;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const INITIAL_INDEX = 60;
const MONTHS_TO_GENERATE = 121;

function getMonthGrid(
  year: number,
  month: number,
  weekStartsOn: number,
): Date[] {
  const firstDayOfMonth = new Date(year, month, 1);
  let dayOfWeek = firstDayOfMonth.getDay();

  dayOfWeek = (dayOfWeek - weekStartsOn + 7) % 7;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
}

const MonthGrid = ({
  year,
  month,
  selectedDate,
  onSelectDate,
  width,
  weekStartsOn,
}: MonthGridProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const logs = useLogStore((s) => s.logs);
  const medications = useMedicationStore((s) => s.medications);
  const { formatTimeString } = useTimeFormat();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dates = useMemo(
    () => getMonthGrid(year, month, weekStartsOn),
    [year, month, weekStartsOn],
  );

  const weekdayMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (let i = 0; i < 7; i++) map[(weekStartsOn + i) % 7] = i + 1;
    return map;
  }, [weekStartsOn]);

  const statsByDate = useMemo(() => {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    const scheduleMap = buildScheduleForDateRange(
      medications,
      logs,
      firstDate,
      lastDate,
      weekdayMap,
      formatTimeString,
    );
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    type Counters = {
      taken: number;
      skipped: number;
      missed: number;
      pending: number;
    };
    const counters: Record<string, Counters> = {};

    for (const entries of scheduleMap.values()) {
      for (const entry of entries) {
        const dateStr = entry.scheduledDate;
        if (!counters[dateStr]) {
          counters[dateStr] = { taken: 0, skipped: 0, missed: 0, pending: 0 };
        }

        const log = entry.log;

        if (log?.takenAt && !log.skipped) {
          counters[dateStr].taken++;
        } else if (log?.skipped) {
          counters[dateStr].skipped++;
        } else {
          const isPast =
            dateStr < todayStr ||
            (dateStr === todayStr && entry.scheduledTime < nowTimeStr);

          if (isPast) {
            counters[dateStr].missed++;
          } else {
            counters[dateStr].pending++;
          }
        }
      }
    }

    const result: Record<string, { hasLogs: boolean; adherenceColor: string }> =
      {};

    for (const [dateStr, c] of Object.entries(counters)) {
      const actionable = c.taken + c.missed;
      const adherenceRate =
        actionable > 0 ? Math.round((c.taken / actionable) * 100) : 100;

      let adherenceColor: string;
      if (actionable === 0) {
        adherenceColor =
          c.skipped > 0 ? theme.textSecondary : theme.textDisabled;
      } else if (adherenceRate === 100) {
        adherenceColor = theme.success;
      } else if (adherenceRate > 0) {
        adherenceColor = theme.warning;
      } else {
        adherenceColor = theme.error;
      }

      const hasLogs = c.taken + c.skipped + c.missed > 0;

      result[dateStr] = { hasLogs, adherenceColor };
    }

    return result;
  }, [dates, medications, logs, weekdayMap, formatTimeString, theme]);

  const getDayStats = useCallback(
    (date: Date) => {
      const key = getLocalDateString(date);
      return (
        statsByDate[key] ?? {
          hasLogs: false,
          adherenceColor: theme.textDisabled,
        }
      );
    },
    [statsByDate, theme],
  );

  const renderDay = useCallback(
    (date: Date, index: number) => {
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isCurrentMonth = date.getMonth() === month;
      const { hasLogs, adherenceColor } = getDayStats(date);

      return (
        <Pressable
          key={index}
          style={styles.dayCell}
          onPress={() => onSelectDate(date)}
        >
          <View
            style={[
              styles.dayContent,
              isToday && styles.dayToday,
              isSelected && styles.daySelected,
              !isCurrentMonth && styles.dayOtherMonth,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
                !isCurrentMonth && styles.dayTextOtherMonth,
              ]}
            >
              {date.getDate()}
            </Text>

            {hasLogs && (
              <View
                style={[
                  styles.adherenceDot,
                  { backgroundColor: adherenceColor },
                ]}
              />
            )}
          </View>
        </Pressable>
      );
    },
    [today, selectedDate, month, getDayStats, onSelectDate, styles],
  );

  const { t } = useTranslation();

  const DAYS = useMemo(() => {
    const allDays = [
      t("weekdays.sunShort"),
      t("weekdays.monShort"),
      t("weekdays.tueShort"),
      t("weekdays.wedShort"),
      t("weekdays.thuShort"),
      t("weekdays.friShort"),
      t("weekdays.satShort"),
    ];
    return [...allDays.slice(weekStartsOn), ...allDays.slice(0, weekStartsOn)];
  }, [weekStartsOn, t]);

  return (
    <View style={[styles.monthContainer, { width }]}>
      <View style={styles.weekHeader}>
        {DAYS.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {dates.map((date: Date, i: number) => renderDay(date, i))}
      </View>
    </View>
  );
};

const MonthlyCalendar = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
}: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width: screenWidth } = useWindowDimensions();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const { i18n } = useTranslation();
  const didMountRef = useRef(false);

  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: MONTHS_TO_GENERATE }, (_, i) => {
      const offset = i - INITIAL_INDEX;
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      return {
        offset,
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;

      if (onMonthChange && months[index]) {
        const monthData = months[index];
        const firstDay = new Date(monthData.year, monthData.month, 1);
        const currentLocale = i18n.language?.split("-")[0] ?? "en";
        const label = firstDay.toLocaleDateString(currentLocale, {
          month: "long",
          year: "numeric",
        });
        onMonthChange(label, monthData.year, monthData.month);
      }
    }
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: (typeof months)[0] }) => (
      <MonthGrid
        year={item.year}
        month={item.month}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        width={screenWidth}
        weekStartsOn={weekStartsOn}
      />
    ),
    [selectedDate, onSelectDate, screenWidth, weekStartsOn],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={months}
        keyExtractor={(item) => `${item.year}-${item.month}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={INITIAL_INDEX}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    monthContainer: {
      paddingHorizontal: 16,
    },
    weekHeader: {
      flexDirection: "row",
      marginBottom: 8,
    },
    weekDayText: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      maxWidth: `${100 / 7}%`,
      aspectRatio: 1,
      padding: 2,
    },
    dayContent: {
      flex: 1,
      width: "100%",
      aspectRatio: 1,
      padding: 2,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 64,
      position: "relative",
    },
    dayToday: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    daySelected: {
      backgroundColor: theme.primary + "20",
      borderRadius: 32,
    },
    dayOtherMonth: {
      opacity: 0.5,
    },
    dayText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    dayTextSelected: {
      color: theme.primaryDark,
      fontWeight: "600",
    },
    dayTextOtherMonth: {
      color: theme.textSecondary,
    },
    adherenceDot: {
      position: "absolute",
      bottom: 4,
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  });

export default MonthlyCalendar;
