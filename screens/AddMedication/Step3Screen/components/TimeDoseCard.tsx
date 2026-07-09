import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import TrashIcon from "../../../../assets/icons/trash.svg";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";
import { UnitOption } from "../../../../constants/units";
import { TimeSection } from "./TimeSection";
import { DoseSection } from "./DoseSection";

type Props = {
  index: number;
  amount: string;
  selectedUnit: string;
  unitLabel: string;
  availableUnits: UnitOption[];
  canRemove: boolean;
  onRemove: () => void;
  onOpenTimePicker: () => void;
  onAmountChange: (text: string) => void;
  onUnitChange: (value: string) => void;
  formattedTime: string;
  hideTime?: boolean;
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
  hideTime = false,
}: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      {canRemove && (
        <View style={styles.header}>
          <Pressable onPress={onRemove} style={styles.removeButton}>
            <TrashIcon width={18} height={18} stroke={theme.error} />
          </Pressable>
        </View>
      )}

      {!hideTime && (
        <TimeSection formattedTime={formattedTime} onOpenTimePicker={onOpenTimePicker} />
      )}

      <DoseSection
        amount={amount}
        selectedUnit={selectedUnit}
        unitLabel={unitLabel}
        availableUnits={availableUnits}
        onAmountChange={onAmountChange}
        onUnitChange={onUnitChange}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.textSecondary + "20",
    },
    header: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
    removeButton: { padding: 4 },
  });