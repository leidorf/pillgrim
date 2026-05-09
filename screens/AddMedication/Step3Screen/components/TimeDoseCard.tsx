import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import TrashIcon from "../../../../assets/icons/trash.svg";
import { Colors } from "../../../../constants/theme";

type Props = {
  index: number;
  time: Date;
  amount: string;
  selectedUnit: string;
  unitLabel: string;
  isTimePickerOpen: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onOpenTimePicker: () => void;
  onTimeChange: (event: DateTimePickerEvent, date?: Date) => void;
  onAmountChange: (text: string) => void;
  formattedTime: string;
};

const isValidAmount = (amount: string) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const TimeDoseCard = ({
  index,
  time,
  amount,
  selectedUnit,
  unitLabel,
  isTimePickerOpen,
  canRemove,
  onRemove,
  onOpenTimePicker,
  onTimeChange,
  onAmountChange,
  formattedTime,
}: Props) => {
  const hasInvalidAmount = amount.length > 0 && !isValidAmount(amount);

  return (
    <View style={styles.card}>
      {/* Header: dose number + optional remove */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>#{index + 1}</Text>
        </View>
        {canRemove && (
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <TrashIcon
              width={18}
              height={18}
              stroke={Colors.error || "#EF4444"}
            />
          </Pressable>
        )}
      </View>

      {/* --------------------------- Time Picker Trigger -------------------------- */}
      <Pressable style={styles.timeButton} onPress={onOpenTimePicker}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.timeHint}>Tap to change time</Text>
      </Pressable>

      {isTimePickerOpen && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {/* ------------------------------ Amount Input ------------------------------ */}
      {selectedUnit ? (
        <View
          style={[styles.amountRow, hasInvalidAmount && styles.amountRowError]}
        >
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={onAmountChange}
            placeholder="Enter amount"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="decimal-pad"
            maxLength={6}
          />
          <Text style={styles.unitLabel}>{unitLabel}</Text>
        </View>
      ) : (
        <Text style={styles.unitHint}>Please select a unit first</Text>
      )}

      {hasInvalidAmount && (
        <Text style={styles.errorText}>
          Please enter a positive number greater than 0
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "20",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  removeButton: { padding: 4 },
  timeButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  timeText: { color: Colors.textPrimary, fontSize: 28, fontWeight: "700" },
  timeHint: { color: Colors.textSecondary, fontSize: 12 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  amountRowError: {
    borderColor: Colors.error || "#EF4444",
    borderWidth: 2,
  },
  amountInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  unitLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500" },
  unitHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  errorText: {
    color: Colors.error || "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
