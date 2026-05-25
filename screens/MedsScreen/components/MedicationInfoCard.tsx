import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { Medication } from "../../../types/medication";
import BaseMedicationCard from "../../../components/BaseMedicationCard";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  medication: Medication;
  isInactive?: boolean;
  onPress: () => void;
};

const MedicationInfoCard = ({ medication, isInactive, onPress }: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BaseMedicationCard
      medication={medication}
      isInactive={isInactive}
      onPress={onPress}
    >
      {isInactive && (
        <View style={styles.pausedBadge}>
          <Text style={styles.pausedText}>PAUSED</Text>
        </View>
      )}
    </BaseMedicationCard>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  pausedBadge: {
    backgroundColor: theme.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pausedText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.warning,
  },
});

export default MedicationInfoCard;