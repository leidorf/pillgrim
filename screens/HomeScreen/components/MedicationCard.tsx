import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "../../../components/Text";
import { Medication, MedicationLog } from "../../../types/medication";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import CircleIcon from "../../../assets/icons/circle.svg";
import CloseIcon from "../../../assets/icons/circle-close.svg";
import MinusIcon from "../../../assets/icons/circle-minus.svg";
import { Colors } from "../../../constants/theme";
import BaseMedicationCard from "../../../components/BaseMedicationCard";
import { useCallback, useMemo } from "react";

type MedicationCardProps = {
  medication: Medication;
  time: string;
  displayTime: string;
  dose: string;
  log?: MedicationLog;
  isMissed?: boolean;
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
  displayTime,
  dose,
  log,
  isMissed,
  onToggle,
  onOpenSheet,
}: MedicationCardProps) => {
  const isTaken = !!log?.takenAt && !log?.skipped;
  const isSkipped = !!log?.skipped;

  const containerStyle = useMemo((): ViewStyle => {
    if (isTaken)
      return {
        backgroundColor: Colors.successLight,
        borderColor: Colors.primary,
      };
    if (isSkipped)
      return {
        backgroundColor: Colors.border,
      };
    if (isMissed)
      return {
        backgroundColor: Colors.warningLight,
        borderColor: Colors.error,
      };
    return {};
  }, [isTaken, isSkipped, isMissed]);

  const handleTaken = useCallback(() => {
    onToggle?.(medication.id, time);
  }, [onToggle, medication.id, time]);

  const timeTextStyle = useMemo(() => {
    if (isTaken) return styles.takenText;
    if (isSkipped) return styles.skippedTimeText;
    if (isMissed) return styles.missedTimeText;
    return undefined;
  }, [isTaken, isSkipped, isMissed]);

  return (
    <BaseMedicationCard
      medication={medication}
      isInactive={isSkipped || isMissed}
      style={containerStyle}
      onPress={() => onOpenSheet?.(medication, time, log)}
      dose={dose}
    >
      <View style={styles.timeSection}>
        <Text style={[styles.timeText, timeTextStyle]}>{displayTime}</Text>
        <Pressable style={styles.checkButton} onPress={handleTaken} hitSlop={8}>
          {isTaken ? (
            <CheckIcon width={28} height={28} color={Colors.primary} />
          ) : isSkipped ? (
            <MinusIcon width={28} height={28} stroke={Colors.textSecondary} />
          ) : isMissed ? (
            <CloseIcon width={28} height={28} stroke={Colors.error} />
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
  takenText: { color: Colors.primaryDark },
  skippedTimeText: { color: Colors.textSecondary },
  missedTimeText: { color: Colors.error },
  checkButton: { padding: 4 },
});

export default MedicationCard;
