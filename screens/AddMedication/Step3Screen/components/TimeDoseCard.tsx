import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, Modal, ScrollView } from "react-native";
import { Text } from "../../../../components/Text";

import { Colors } from "../../../../constants/theme";

import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import CheckIcon from "../../../../assets/icons/check.svg";
import TrashIcon from "../../../../assets/icons/trash.svg";

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
  index,
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
  const hasInvalidAmount = amount.length > 0 && !isValidAmount(amount);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  return (
    <View style={styles.card}>
      {/* --------------------------------- Header --------------------------------- */}
      <View style={styles.header}>
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

      {/* ------------------------------- Time Picker ------------------------------ */}
      <Pressable style={styles.timeButton} onPress={onOpenTimePicker}>
        <Text style={styles.timeText}>
          {formattedTime}
        </Text>
        <Text style={styles.timeHint}>
          Tap to change time
        </Text>
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
          placeholderTextColor={Colors.textSecondary}
          keyboardType="decimal-pad"
          maxLength={6}
        />

        <Pressable
          style={styles.unitDropdownTrigger}
          onPress={() => setUnitDropdownOpen(true)}
        >
          <Text style={styles.unitLabel}>
            {unitLabel || "Select unit"}
          </Text>
          <ArrowDownIcon width={14} height={14} stroke={Colors.textSecondary} />
        </Pressable>
      </View>

      {hasInvalidAmount && (
        <Text style={styles.errorText}>
          Please enter a positive number greater than 0
        </Text>
      )}

      {/* --------------------------- Unit Dropdown Modal -------------------------- */}
      <Modal
        visible={unitDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUnitDropdownOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setUnitDropdownOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>
              Select Unit
            </Text>
            <View style={styles.separator} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownContent}
            >
              {availableUnits.map((unit) => {
                const isActive = selectedUnit === unit.value;
                return (
                  <Pressable
                    key={unit.value}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      onUnitChange(unit.value);
                      setUnitDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isActive && styles.dropdownItemTextActive,
                      ]}
                    >
                      {unit.label}
                    </Text>
                    {isActive && (
                      <CheckIcon
                        width={16}
                        height={16}
                        stroke={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: "flex-end",
    alignItems: "center",
  },
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
  timeText: { color: Colors.textPrimary, fontWeight: "700", fontSize: 30 },
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
    borderLeftColor: Colors.textSecondary + "30",
  },
  unitLabel: { color: Colors.textSecondary, fontSize: 14 },
  errorText: {
    color: Colors.error || "#EF4444",
    marginTop: 4,
    fontSize: 12,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: "100%",
    maxWidth: 280,
    maxHeight: 360,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontWeight: "700",
    color: Colors.textPrimary,
    paddingHorizontal: 4,
    fontSize: 18,
  },
  dropdownContent: { gap: 2 },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + "10",
  },
  dropdownItemText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.textSecondary + "20",
    marginVertical: 10,
  },
});
