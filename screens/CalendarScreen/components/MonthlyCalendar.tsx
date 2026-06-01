import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Text } from "../../../components/Text";
import { useRef, useState, useMemo, useCallback } from "react";
import { useLogStore } from "../../../store/logsStore";
import { useSettingsStore } from "../../../store/settingsStore";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";
import { useTranslation } from "react-i18next";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (monthLabel: string, year: number, month: number) => void;
};

type MonthGridProps = {
  year: number;
  month: number;
  selectedDate: Date;
  currentMonth: number;
  onSelectDate: (date: Date) => void;
  width: number;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const INITIAL_INDEX = 100;
const MONTHS_TO_GENERATE = 200;

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
  currentMonth,
  onSelectDate,
  width,
  weekStartsOn,
}: MonthGridProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dates = useMemo(
    () => getMonthGrid(year, month, weekStartsOn),
    [year, month, weekStartsOn],
  );
  const logs = useLogStore((state) => state.logs);

  const getDayStats = useCallback(
    (dVal: Date) => {
      const y = dVal.getFullYear();
      const m = String(dVal.getMonth() + 1).padStart(2, "0");
      const d = String(dVal.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const dayLogs = logs.filter((log) => log.scheduledDate === dateStr);
      const hasLogs = dayLogs.length > 0;

      const takenMeds = dayLogs.filter(
        (log) => log.takenAt && !log.skipped,
      ).length;
      const missedMeds = dayLogs.filter(
        (log) => !log.takenAt && !log.skipped,
      ).length;
      const actionable = takenMeds + missedMeds;
      const adherenceRate =
        actionable > 0 ? Math.round((takenMeds / actionable) * 100) : 100;

      return { hasLogs, adherenceRate };
    },
    [logs],
  );

  const getAdherenceColor = (rate: number) => {
    if (rate === 100) return theme.success;
    if (rate > 0) return theme.warning;
    return theme.error;
  };

  const renderDay = useCallback(
    (date: Date, index: number) => {
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isCurrentMonth = date.getMonth() === currentMonth;
      const stats = getDayStats(date);
      const adherenceColor = getAdherenceColor(stats.adherenceRate);

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

            {stats.hasLogs && (
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
    [today, selectedDate, currentMonth, getDayStats, onSelectDate, logs],
  );

  const { t, i18n } = useTranslation();
  const locale = i18n.language?.split("-")[0] ?? "en";

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
  }, [weekStartsOn]);

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
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const { i18n } = useTranslation();
  const locale = i18n.language?.split("-")[0] ?? "en";

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
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);

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
        currentMonth={item.month}
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
        ref={flatListRef}
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
      backgroundColor: theme.successLight,
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
