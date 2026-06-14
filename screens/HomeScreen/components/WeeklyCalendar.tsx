import { useTranslation } from "react-i18next";
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Text } from "../../../components/Text";
import { useMemo, useRef, useState } from "react";

import { WEEKDAYS } from "../../../constants/schedules";
import { useSettingsStore } from "../../../store/settingsStore";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasMedsOnDate: (date: Date) => boolean;
};

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const getDayKeys = (weekStartsOn: number) => {
  const allKeys = WEEKDAYS.map((d) => d.labelKey);

  return [...allKeys.slice(weekStartsOn), ...allKeys.slice(0, weekStartsOn)];
};

const INITIAL_INDEX = 104;

function getWeekDates(weekOffset: number, weekStartsOn: WeekStart): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();

  let daysFromStart = dayOfWeek - weekStartsOn;
  if (daysFromStart < 0) daysFromStart += 7;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysFromStart);
  weekStart.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + weekOffset * 7 + i);
    return d;
  });
}

type WeekProps = {
  weekOffset: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasMedsOnDate: (date: Date) => boolean;
  width: number;
  weekStartsOn: WeekStart;
};

const Week = ({
  weekOffset,
  selectedDate,
  onSelectDate,
  hasMedsOnDate,
  width,
  weekStartsOn,
}: WeekProps) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = new Date();
  const dates = getWeekDates(weekOffset, weekStartsOn);
  const DAY_KEYS = getDayKeys(weekStartsOn);

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
            <Text style={styles.dayName}>{t(DAY_KEYS[i])}</Text>
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
  const { i18n } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn) as WeekStart;
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const locale = i18n.language?.split("-")[0] ?? "en";

  const weeks = Array.from(
    { length: INITIAL_INDEX * 2 },
    (_, i) => i - INITIAL_INDEX,
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentWeekOffset(viewableItems[0].item);
    }
  }).current;

  const monthLabel = (() => {
    const dates = getWeekDates(currentWeekOffset, weekStartsOn);
    const first = dates[0];
    const last = dates[6];
    if (first.getMonth() === last.getMonth()) {
      return first.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });
    }
    return `${first.toLocaleDateString(locale, { month: "short" })} – ${last.toLocaleDateString(locale, { month: "long", year: "numeric" })}`;
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
            weekStartsOn={weekStartsOn}
          />
        )}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: 12,
    },
    monthLabel: {
      fontSize: 24,
      fontWeight: "500",
      textAlign: "center",
      marginBottom: 16,
      color: theme.textPrimary,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 24,
    },
    dayCol: { alignItems: "center", gap: 4 },
    dayName: { fontSize: 12, color: theme.textSecondary },
    dayNum: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    dayNumToday: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    dayNumSelected: { backgroundColor: theme.successLight, borderRadius: 17 },
    dayNumText: { fontSize: 14, fontWeight: "500", color: theme.textPrimary },
    dayNumTextSelected: { color: theme.primaryDark },
    dot: {
      top: -9,
      width: 8,
      height: 8,
      borderWidth: 2,
      borderRadius: 4,
      borderColor: theme.primary,
    },
    dotToday: { borderColor: theme.primary },
    dotActive: { backgroundColor: theme.background },
  });

export default WeeklyCalendar;
