import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "../../../../components/Text";
import { useTranslation } from "react-i18next";

import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import { DropdownModal } from "../../../../components/DropdownModal";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";
import { UnitOption } from "../../../../constants/units";

type Props = {
  amount: string;
  selectedUnit: string;
  unitLabel: string;
  availableUnits: UnitOption[];
  onAmountChange: (text: string) => void;
  onUnitChange: (value: string) => void;
};

const isValidAmount = (amount: string) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const DoseSection = ({
  amount,
  selectedUnit,
  unitLabel,
  availableUnits,
  onAmountChange,
  onUnitChange,
}: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasInvalidAmount = amount.length > 0 && !isValidAmount(amount);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const translatedUnitOptions = useMemo(
    () =>
      availableUnits.map((u) => ({
        value: u.value,
        label: u.labelKey ? t(u.labelKey) : u.label,
      })),
    [availableUnits, t],
  );

  return (
    <View>
      <View style={[styles.amountRow, hasInvalidAmount && styles.amountRowError]}>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={onAmountChange}
          placeholder={t("addMedication.enterAmount")}
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          maxLength={6}
        />

        <Pressable
          style={styles.unitDropdownTrigger}
          onPress={() => setUnitDropdownOpen(true)}
        >
          <Text style={styles.unitLabel}>{unitLabel || t("addMedication.selectUnit")}</Text>
          <ArrowDownIcon width={14} height={14} stroke={theme.textSecondary} />
        </Pressable>
      </View>

      {hasInvalidAmount && (
        <Text style={styles.errorText}>{t("addMedication.invalidAmount")}</Text>
      )}

      <DropdownModal
        visible={unitDropdownOpen}
        title={t("addMedication.selectUnitTitle")}
        options={translatedUnitOptions}
        selectedValue={selectedUnit}
        onSelect={onUnitChange}
        onClose={() => setUnitDropdownOpen(false)}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    amountRowError: { borderColor: theme.error, borderWidth: 2 },
    amountInput: { flex: 1, color: theme.textPrimary, fontWeight: "600", fontSize: 14 },
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
    errorText: { color: theme.error, marginTop: 4, fontSize: 12 },
  });