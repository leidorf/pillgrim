import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Medication, MedicationLog } from "../../../types/medication";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import CircleIcon from "../../../assets/icons/circle.svg";
import CloseIcon from "../../../assets/icons/circle-close.svg";
import { Colors } from "../../../constants/theme";
import BaseMedicationCard from "../../../components/BaseMedicationCard";
import { useCallback, useMemo } from "react";

type MedicationCardProps = {
  medication: Medication;
  time: string;
  dose: string;
  log?: MedicationLog;
  onToggle?: (medicationId: string, time: string) => void;
  onOpenSheet?: (
    medication: Medication,
    time: string,
    log?: MedicationLog,
  ) => void;
};

const MedicationCard = ({
  medication,
  time,
  dose,
  log,
  onToggle,
  onOpenSheet,
}: MedicationCardProps) => {
  const isTaken = !!log?.takenAt && !log?.skipped;
  const isSkipped = !!log?.skipped;

  const containerStyle = useMemo((): ViewStyle => {
    if (isTaken)
      return {
        backgroundColor: Colors.primary + "10",
        borderColor: Colors.primary + "30",
        opacity: 0.9,
      };
    if (isSkipped)
      return {
        backgroundColor: Colors.textSecondary + "10",
        opacity: 0.7,
      };
    return {};
  }, [isTaken, isSkipped]);

  const handleTaken = useCallback(() => {
    onToggle?.(medication.id, time);
  }, [onToggle, medication.id, time]);

  return (
    <BaseMedicationCard
      medication={medication}
      isInactive={isSkipped}
      style={containerStyle}
      onPress={() => onOpenSheet?.(medication, time, log)}
      dose={dose}
    >
      <View style={styles.timeSection}>
        <Text
          style={[
            styles.timeText,
            isTaken && styles.takenText,
            isSkipped && styles.skippedTimeText,
          ]}
        >
          {time}
        </Text>
        <Pressable
          style={styles.checkButton}
          onPress={() => onToggle?.(medication.id, time)}
          hitSlop={8}
        >
          {isTaken ? (
            <CheckIcon width={28} height={28} color={Colors.primary} />
          ) : isSkipped ? (
            <CloseIcon width={28} height={28} color={Colors.textSecondary} />
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
  timeSection: { flexDirection: "row", alignItems: "center", gap: 12 },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  takenText: { color: Colors.primary },
  skippedTimeText: { color: Colors.textSecondary },
  checkButton: { padding: 4 },
});

export default MedicationCard;
