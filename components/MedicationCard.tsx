import { Pressable, StyleSheet, Text, View } from "react-native";
import { Medication, MedicationLog } from "../types/medication";
import PillIcon from "../assets/icons/pill.svg";
import CheckIcon from "../assets/icons/circle-check-big.svg";
import CircleIcon from "../assets/icons/circle.svg";
import { Colors } from "../constants/theme";
import { MED_FORMS } from "../constants/medication-forms";

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
  onSkip,
}: MedicationCardProps) => {
  const isTaken = log?.takenAt && !log?.skipped;
  const isSkipped = log?.skipped;

  const getFormIcon = () => {
    const form = MED_FORMS.find((f) => f.id === medication.form);
    return form?.Icon || PillIcon;
  };

  const FormIcon = getFormIcon();

  const getNoteText = () => {
    if (!medication.note) return "";
    const noteMap: Record<string, string> = {
      before_meal: "Before meal",
      with_meal: "With meal",
      after_meal: "After meal",
      empty_stomach: "Empty stomach",
      any: "",
    };
    return noteMap[medication.note] || medication.note;
  };

  const displayTime = time || medication.times?.[0] || "--:--";
  const displayDose = medication.dose || "1 unit";

  return (
    <Pressable
      style={[
        styles.container,
        isTaken && styles.takenContainer,
        isSkipped && styles.skippedContainer,
      ]}
      onPress={() => onToggle?.(medication.id || "", time)}
    >
      <View style={styles.leftSection}>
        <View
          style={[styles.iconContainer, isTaken && styles.takenIconContainer]}
        >
          <FormIcon
            height={24}
            width={24}
            stroke={isTaken ? Colors.primary : Colors.textPrimary}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[styles.nameText, isTaken && styles.takenText]}
            numberOfLines={1}
          >
            {medication.name}
          </Text>

          {getNoteText() ? (
            <Text style={styles.noteText}>({getNoteText()})</Text>
          ) : null}

          <Text style={styles.doseText}>{displayDose}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.timeText, isTaken && styles.takenText]}>
          {displayTime}
        </Text>

        <Pressable
          style={styles.checkButton}
          onPress={() => onToggle?.(medication.id || "", time)}
          hitSlop={8}
        >
          {isTaken ? (
            <CheckIcon height={28} width={28} color={Colors.primary} />
          ) : isSkipped ? (
            <View style={styles.skippedCircle}>
              <Text style={styles.skippedText}>✕</Text>
            </View>
          ) : (
            <CircleIcon
              height={28}
              width={28}
              stroke={Colors.primary}
              strokeWidth={2}
            />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
};

export default MedicationCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 8,
  },
  takenContainer: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary + "30",
    opacity: 0.9,
  },
  skippedContainer: {
    backgroundColor: Colors.textSecondary + "10",
    opacity: 0.7,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  takenIconContainer: {
    backgroundColor: Colors.primary + "20",
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  doseText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  skippedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
