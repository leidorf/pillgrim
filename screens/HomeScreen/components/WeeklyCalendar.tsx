import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useRef, useState } from "react";
import { Colors } from "../../../constants/theme";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasMedsOnDate: (date: Date) => boolean;
};

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const INITIAL_INDEX = 100;

function getWeekDates(mondayOffset: number): Date[] {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - dayOfWeek);
  thisMonday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(thisMonday);
    d.setDate(thisMonday.getDate() + mondayOffset * 7 + i);
    return d;
  });
}

type WeekProps = {
  weekOffset: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasMedsOnDate: (date: Date) => boolean;
  width: number;
};

const Week = ({
  weekOffset,
  selectedDate,
  onSelectDate,
  hasMedsOnDate,
  width,
}: WeekProps) => {
  const today = new Date();
  const dates = getWeekDates(weekOffset);

  return (
    <View style={[styles.weekRow, { width }]}>
      {dates.map((date, i) => {
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const hasMeds = hasMedsOnDate(date);

        return (
          <Pressable
            key={i}
            style={styles.dayCol}
            onPress={() => onSelectDate(date)}
          >
            <Text style={styles.dayName}>{DAYS[i]}</Text>
            <View
              style={[
                styles.dayNum,
                isToday && styles.dayNumToday,
                isSelected && styles.dayNumSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayNumText,
                  isSelected && styles.dayNumTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
            {hasMeds && (
              <View
                style={[
                  styles.dot,
                  isToday && styles.dotToday,
                  styles.dotActive,
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const WeeklyCalendar = ({
  selectedDate,
  onSelectDate,
  hasMedsOnDate,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const weeks = Array.from({ length: 200 }, (_, i) => i - INITIAL_INDEX);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentWeekOffset(viewableItems[0].item);
    }
  }).current;

  const monthLabel = (() => {
    const dates = getWeekDates(currentWeekOffset);
    const first = dates[0];
    const last = dates[6];
    if (first.getMonth() === last.getMonth()) {
      return first.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return `${first.toLocaleDateString("en-US", { month: "short" })} – ${last.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>
      <FlatList
        ref={flatListRef}
        data={weeks}
        keyExtractor={(item) => item.toString()}
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
        renderItem={({ item: weekOffset }) => (
          <Week
            weekOffset={weekOffset}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            hasMedsOnDate={hasMedsOnDate}
            width={screenWidth}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  monthLabel: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  dayCol: { alignItems: "center", gap: 4 },
  dayName: { fontSize: 12, color: Colors.textSecondary },
  dayNum: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayNumSelected: { backgroundColor: Colors.subtle, borderRadius: 17 },
  dayNumText: { fontSize: 14, fontWeight: "500", color: Colors.textPrimary },
  dayNumTextSelected: { color: Colors.dark },
  dot: {
    top: -9,
    width: 8,
    height: 8,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: Colors.subtle,
  },
  dotToday: { borderColor: Colors.primary },
  dotActive: { backgroundColor: Colors.background },
});

export default WeeklyCalendar;
