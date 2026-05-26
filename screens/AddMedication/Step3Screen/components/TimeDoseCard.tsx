import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "../../../../components/Text";

import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import TrashIcon from "../../../../assets/icons/trash.svg";
import { DropdownModal } from "../../../../components/DropdownModal";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Unit = { value: string; label: string };

type Props = {
  index: number;
  amount: string;
  selectedUnit: string;
  unitLabel: string;
  availableUnits: Unit[];
  canRemove: boolean;
  onRemove: () => void;
  onOpenTimePicker: () => void;
  onAmountChange: (text: string) => void;
  onUnitChange: (value: string) => void;
  formattedTime: string;
};

const isValidAmount = (amount: string) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const TimeDoseCard = ({
  amount,
  selectedUnit,
  unitLabel,
  availableUnits,
  canRemove,
  onRemove,
  onOpenTimePicker,
  onAmountChange,
  onUnitChange,
  formattedTime,
}: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasInvalidAmount = amount.length > 0 && !isValidAmount(amount);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  return (
    <View style={styles.card}>
      {/* --------------------------------- Header --------------------------------- */}
      <View style={styles.header}>
        {canRemove && (
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <TrashIcon width={18} height={18} stroke={theme.error} />
          </Pressable>
        )}
      </View>

      {/* ------------------------------- Time Picker ------------------------------ */}
      <Pressable style={styles.timeButton} onPress={onOpenTimePicker}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.timeHint}>Tap to change time</Text>
      </Pressable>

      {/* ---------------------------- Dose - Unit Input --------------------------- */}
      <View
        style={[styles.amountRow, hasInvalidAmount && styles.amountRowError]}
      >
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={onAmountChange}
          placeholder="Enter amount"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          maxLength={6}
        />

        <Pressable
          style={styles.unitDropdownTrigger}
          onPress={() => setUnitDropdownOpen(true)}
        >
          <Text style={styles.unitLabel}>{unitLabel || "Select unit"}</Text>
          <ArrowDownIcon width={14} height={14} stroke={theme.textSecondary} />
        </Pressable>
      </View>

      {hasInvalidAmount && (
        <Text style={styles.errorText}>
          Please enter a positive number greater than 0
        </Text>
      )}

      {/* --------------------------- Unit Dropdown Modal -------------------------- */}
      <DropdownModal
        visible={unitDropdownOpen}
        title="Select Unit"
        options={availableUnits}
        selectedValue={selectedUnit}
        onSelect={onUnitChange}
        onClose={() => setUnitDropdownOpen(false)}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.textSecondary + "20",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  removeButton: { padding: 4 },
  timeButton: {
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: theme.textSecondary + "30",
  },
  timeText: { color: theme.textPrimary, fontWeight: "700", fontSize: 30 },
  timeHint: { color: theme.textSecondary, fontSize: 12 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.textSecondary + "30",
  },
  amountRowError: {
    borderColor: theme.error,
    borderWidth: 2,
  },
  amountInput: {
    flex: 1,
    color: theme.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  unitDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: theme.textSecondary + "30",
  },
  unitLabel: { color: theme.textPrimary, fontWeight: "600", fontSize: 14 },
  errorText: {
    color: theme.error,
    marginTop: 4,
    fontSize: 12,
  },
});
