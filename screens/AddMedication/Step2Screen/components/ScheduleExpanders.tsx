import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "../../../../components/Text";
import { WEEKDAYS } from "../../../../constants/schedules";
import InlineContainer from "../../components/InlineContainer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/* --------------------------------- Weekday -------------------------------- */
type WeekdayProps = {
  selected: number[];
  onToggle: (day: number) => void;
  weekStartsOn?: number;
};

export const WeekdayPicker = ({
  selected,
  onToggle,
  weekStartsOn = 1,
}: WeekdayProps) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const orderedWeekdays = useMemo(() => {
    return [
      ...WEEKDAYS.slice(weekStartsOn),
      ...WEEKDAYS.slice(0, weekStartsOn),
    ];
  }, [weekStartsOn]);

  return (
    <InlineContainer containerText={t("addMedication.selectDays")}>
      <View style={styles.weekdayRow}>
        {orderedWeekdays.map(({ id, labelKey }) => {
          const active = selected.includes(id);
          return (
            <Pressable
              key={id}
              style={[
                styles.chip,
                styles.chipCircle,
                active && styles.chipActive,
              ]}
              onPress={() => onToggle(id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </InlineContainer>
  );
};

/* -------------------------------- Interval -------------------------------- */
type IntervalProps = {
  value: string;
  onChange: (val: string) => void;
};

export const IntervalPicker = ({ value, onChange }: IntervalProps) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const step = (delta: number) => {
    const next = Math.max(1, parseInt(value || "1") + delta);
    onChange(next.toString());
  };

  return (
    <InlineContainer containerText={t("addMedication.everyHowManyDays")}>
      <View style={styles.intervalRow}>
        <Pressable style={styles.stepper} onPress={() => step(-1)}>
          <Text style={styles.stepperText}>−</Text>
        </Pressable>

        <TextInput
          style={styles.intervalInput}
          value={value}
          onChangeText={(text: string) => onChange(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="X"
          placeholderTextColor={theme.textSecondary}
          maxLength={3}
        />

        <Pressable style={styles.stepper} onPress={() => step(1)}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>

        <Text style={styles.intervalUnit}>{t("addMedication.days")}</Text>
      </View>
    </InlineContainer>
  );
};

/* ----------------------------- Month Day Grid ----------------------------- */
type MonthDayProps = {
  selected: number[];
  onToggle: (day: number) => void;
};

export const MonthDayPicker = ({ selected, onToggle }: MonthDayProps) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <InlineContainer containerText={t("addMedication.selectMonthDays")}>
      <View style={styles.monthGrid}>
        {MONTH_DAYS.map((day) => {
          const active = selected.includes(day);
          return (
            <Pressable
              key={day}
              style={[
                styles.chip,
                styles.chipSquare,
                active && styles.chipActive,
              ]}
              onPress={() => onToggle(day)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </InlineContainer>
  );
};

/* -------------------------------- PRN Info -------------------------------- */
export const PrnInfo = () => {
  const { t } = useTranslation();
  return <InlineContainer containerText={t("addMedication.prnInfo")} />;
};

/* --------------------------------- Styles --------------------------------- */
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    weekdayRow: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      flexWrap: "wrap",
    },
    chip: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: "transparent",
      backgroundColor: theme.background,
    },
    chipCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    chipSquare: {
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    chipActive: {
      backgroundColor: theme.primaryDark,
      borderColor: theme.primaryDark,
    },
    chipText: {
      fontWeight: "600",
      color: theme.textPrimary,
      fontSize: 12,
    },
    chipTextActive: {
      color: theme.surfaceElevated,
    },
    intervalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    stepper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperText: {
      color: theme.textPrimary,
      lineHeight: 24,
      fontSize: 18,
    },
    intervalInput: {
      minWidth: 52,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.background,
      color: theme.textPrimary,
      fontWeight: "700",
      textAlign: "center",
      paddingHorizontal: 6,
      fontSize: 16,
    },
    intervalUnit: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
  });
