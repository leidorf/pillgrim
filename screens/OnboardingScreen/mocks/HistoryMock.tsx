import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/Text";
import { Theme } from "../../../constants/theme";
import { useAppTheme } from "../../../theme/useAppTheme";
import { useSettingsStore } from "../../../store/settingsStore";

type DayStatus = "taken" | "warning" | "missed";

const SAMPLE_STATUS: Record<number, DayStatus> = {
  1: "taken",
  2: "taken",
  3: "warning",
  4: "missed",
  5: "taken",
  6: "taken",
  7: "taken",
  8: "warning",
  9: "taken",
  10: "taken",
};

const CELLS = 42;

const getMonthGrid = (year: number, month: number, weekStartsOn: number) => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: CELLS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const HistoryMock = () => {
  const theme = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();

  const dates = useMemo(
    () => getMonthGrid(year, month, weekStartsOn),
    [year, month, weekStartsOn],
  );

  const monthLabel = useMemo(() => {
    const locale = i18n.language?.split("-")[0] ?? "en";
    return new Date(year, month, 1).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }, [i18n.language, year, month]);

  const weekDays = useMemo(() => {
    const all = [
      t("weekdays.sunShort"),
      t("weekdays.monShort"),
      t("weekdays.tueShort"),
      t("weekdays.wedShort"),
      t("weekdays.thuShort"),
      t("weekdays.friShort"),
      t("weekdays.satShort"),
    ];
    return [...all.slice(weekStartsOn), ...all.slice(0, weekStartsOn)];
  }, [t, weekStartsOn]);

  const dotColor = (status: DayStatus) => {
    if (status === "taken") return theme.success;
    if (status === "warning") return theme.warning;
    return theme.error;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>

      <View style={styles.weekHeader}>
        {weekDays.map((d) => (
          <Text key={d} style={styles.weekDayText}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {dates.map((date, i) => {
          const inMonth = date.getMonth() === month;
          const isToday = date.toDateString() === today.toDateString();
          const status = inMonth ? SAMPLE_STATUS[date.getDate()] : undefined;

          return (
            <View key={i} style={styles.cell}>
              <View
                style={[
                  styles.dayContent,
                  isToday && styles.dayToday,
                  !inMonth && styles.dayOtherMonth,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && { color: theme.primary, fontWeight: "700" },
                    !inMonth && styles.dayTextMuted,
                  ]}
                >
                  {date.getDate()}
                </Text>

                {status && (
                  <View
                    style={[styles.dot, { backgroundColor: dotColor(status) }]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: 300,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 24,
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    monthLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: 12,
      textAlign: "center",
    },
    weekHeader: {
      flexDirection: "row",
      marginBottom: 6,
    },
    weekDayText: {
      flex: 1,
      textAlign: "center",
      fontSize: 10,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      padding: 1,
    },
    dayContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      position: "relative",
    },
    dayToday: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    dayOtherMonth: {
      opacity: 0.4,
    },
    dayText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    dayTextMuted: {
      color: theme.textSecondary,
    },
    dot: {
      position: "absolute",
      bottom: 2,
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
  });
