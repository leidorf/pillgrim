import { StyleSheet, Text, View } from "react-native";
import { Medication } from "../../../types/medication";
import BaseMedicationCard from "../../../components/BaseMedicationCard";

type Props = {
  medication: Medication;
  isInactive?: boolean;
  onPress: () => void;
};

const MedicationInfoCard = ({ medication, isInactive, onPress }: Props) => {
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

const styles = StyleSheet.create({
  pausedBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pausedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
});

export default MedicationInfoCard;