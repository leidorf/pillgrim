import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../../../constants/theme";
import { WEEKDAYS } from "../../../../constants/schedules";
import InlineContainer from "../../components/InlineContainer";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/* --------------------------------- Weekday -------------------------------- */
type WeekdayProps = {
  selected: number[];
  onToggle: (day: number) => void;
};

export const WeekdayPicker = ({ selected, onToggle }: WeekdayProps) => (
  <InlineContainer containerText="Select days">
    <View style={styles.weekdayRow}>
      {WEEKDAYS.map(({ id, label }) => {
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
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </InlineContainer>
);

/* -------------------------------- Interval -------------------------------- */
type IntervalProps = {
  value: string;
  onChange: (val: string) => void;
};

export const IntervalPicker = ({ value, onChange }: IntervalProps) => {
  const step = (delta: number) => {
    const next = Math.max(1, parseInt(value || "1") + delta);
    onChange(next.toString());
  };

  return (
    <InlineContainer containerText="Every how many days?">
      <View style={styles.intervalRow}>
        <Pressable style={styles.stepper} onPress={() => step(-1)}>
          <Text style={styles.stepperText}>−</Text>
        </Pressable>

        <TextInput
          style={styles.intervalInput}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          placeholder="X"
          placeholderTextColor={Colors.textSecondary}
          maxLength={3}
        />

        <Pressable style={styles.stepper} onPress={() => step(1)}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>

        <Text style={styles.intervalUnit}>days</Text>
      </View>
    </InlineContainer>
  );
};

/* ----------------------------- Month Day Grid ----------------------------- */
type MonthDayProps = {
  selected: number[];
  onToggle: (day: number) => void;
};

export const MonthDayPicker = ({ selected, onToggle }: MonthDayProps) => (
  <InlineContainer containerText="Select days of the month (1–31)">
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
            <Text
              style={[
                styles.chipText,
                styles.chipTextSmall,
                active && styles.chipTextActive,
              ]}
            >
              {day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </InlineContainer>
);

/* -------------------------------- PRN Info -------------------------------- */
export const PrnInfo = () => (
  <InlineContainer containerText="You can mark this medication manually whenever you need it." />
);

/* --------------------------------- Styles --------------------------------- */
const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  chipTextSmall: {
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  intervalInput: {
    minWidth: 52,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  intervalUnit: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
