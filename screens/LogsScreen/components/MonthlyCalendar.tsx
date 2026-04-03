import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useRef, useState, useMemo, useCallback } from "react";
import { Colors } from "../../../constants/theme";
import { useLogStore } from "../../../store/logsStore";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (monthLabel: string) => void;
};

type MonthGridProps = {
  year: number;
  month: number;
  selectedDate: Date;
  currentMonth: number;
  onSelectDate: (date: Date) => void;
  width: number;
};

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const INITIAL_INDEX = 100;
const MONTHS_TO_GENERATE = 200;

function getMonthGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

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
}: MonthGridProps) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dates = useMemo(() => getMonthGrid(year, month), [year, month]);
  const getDayStats = useLogStore((state) => state.getDayStats);
  const logs = useLogStore((state) => state.logs);
  const getAdherenceColor = (rate: number) => {
    if (rate === 100) return Colors.success || "#22C55E";
    if (rate > 0) return Colors.warning || "#F59E0B";
    return Colors.error || "#EF4444";
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
        {dates.map((date, i) => renderDay(date, i))}
      </View>
    </View>
  );
};

const MonthlyCalendar = ({
  selectedDate,
  onSelectDate,
  onMonthChange,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);

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
        const label = firstDay.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        onMonthChange(label);
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
      />
    ),
    [selectedDate, onSelectDate, screenWidth],
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthContainer: {
    paddingHorizontal: 16,
  },
  monthLabel: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: Colors.textPrimary,
    textTransform: "capitalize",
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
    color: Colors.textSecondary,
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
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 64,
    position: "relative",
  },
  dayToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  daySelected: {
    backgroundColor: Colors.subtle,
    borderRadius: 32,
  },
  dayOtherMonth: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  dayTextSelected: {
    color: Colors.dark,
    fontWeight: "600",
  },
  dayTextOtherMonth: {
    color: Colors.textSecondary,
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
