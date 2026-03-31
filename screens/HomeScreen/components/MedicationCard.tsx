import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Medication, MedicationLog } from "../../../types/medication";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import CircleIcon from "../../../assets/icons/circle.svg";
import { Colors } from "../../../constants/theme";
import BaseMedicationCard from "../../../components/BaseMedicationCard";

type MedicationCardProps = {
  medication: Medication;
  time: string;
  log?: MedicationLog;
  onToggle?: (medicationId: string, time: string) => void;
  onSkip?: (medicationId: string, time: string) => void;
};

const MedicationCard = ({
  medication,
  time,
  log,
  onToggle,
}: MedicationCardProps) => {
  const isTaken = log?.takenAt && !log?.skipped;
  const isSkipped = log?.skipped;

  const displayTime = time || medication.times?.[0] || "--:--";

  const getContainerStyle = (): ViewStyle => {
    if (isTaken) {
      return {
        backgroundColor: Colors.primary + "10",
        borderColor: Colors.primary + "30",
        opacity: 0.9,
      };
    }
    if (isSkipped) {
      return {
        backgroundColor: Colors.textSecondary + "10",
        opacity: 0.7,
      };
    }
    return {};
  };

  return (
    <BaseMedicationCard
      medication={medication}
      isInactive={isSkipped}
      style={getContainerStyle()}
      onPress={() => onToggle?.(medication.id || "", time)}
    >
      <View style={styles.timeSection}>
        <Text
          style={[
            styles.timeText,
            isTaken && styles.takenText,
            isSkipped && styles.skippedText,
          ]}
        >
          {displayTime}
        </Text>

        <Pressable
          style={styles.checkButton}
          onPress={() => onToggle?.(medication.id || "", time)}
          hitSlop={8}
        >
          {isTaken ? (
            <CheckIcon width={28} height={28} color={Colors.primary} />
          ) : isSkipped ? (
            <View style={styles.skippedCircle}>
              <Text style={styles.skippedText}>✕</Text>
            </View>
          ) : (
            <CircleIcon
              width={28}
              height={28}
              stroke={Colors.primary}
              strokeWidth={2}
            />
          )}
        </Pressable>
      </View>
    </BaseMedicationCard>
  );
};

const styles = StyleSheet.create({
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  takenText: {
    color: Colors.primary,
  },
  skippedText: {
    color: Colors.textSecondary,
  },
  checkButton: {
    padding: 4,
  },
  skippedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.textSecondary + "30",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MedicationCard;
