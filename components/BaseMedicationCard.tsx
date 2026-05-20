import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import { Medication } from "../types/medication";
import { MED_FORMS } from "../constants/medication-forms";
import { Colors } from "../constants/theme";
import { PropsWithChildren } from "react";

export type BaseMedicationCardProps = {
  medication: Medication;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  isInactive?: boolean;
  dose?: string;
};

export const getFormIcon = (formId?: string) => {
  const form = MED_FORMS.find((f) => f.id === formId);
  return form?.Icon;
};

export const formatNote = (note?: string): string => {
  if (!note) return "";
  const noteMap: Record<string, string> = {
    before_meal: "Before meal",
    with_meal: "With meal",
    after_meal: "After meal",
    empty_stomach: "Empty stomach",
    any: "",
  };
  return noteMap[note] || note;
};

const BaseMedicationCard = ({
  medication,
  children,
  style,
  onPress,
  isInactive = false,
  dose,
}: PropsWithChildren<BaseMedicationCardProps>) => {
  const { name, form } = medication;
  const FormIcon = getFormIcon(form) || (() => null);

  return (
    <Pressable
      style={[styles.container, isInactive && styles.inactiveContainer, style]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <FormIcon
            width={24}
            height={24}
            stroke={isInactive ? Colors.textSecondary : Colors.textPrimary}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[styles.nameText, isInactive && styles.inactiveText]}
            numberOfLines={1}
          >
            {name}
          </Text>

          {dose && (
            <Text
              style={[styles.doseText, isInactive && styles.inactiveSubtext]}
            >
              {dose}
            </Text>
          )}

          {medication.note && (
            <Text
              style={[styles.noteText, isInactive && styles.inactiveSubtext]}
            >
              {formatNote(medication.note)}
            </Text>
          )}
        </View>
      </View>

      {children && <View style={styles.rightSection}>{children}</View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
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
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
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
  inactiveContainer: {
    opacity: 0.6,
    backgroundColor: Colors.surface,
  },
  inactiveText: {
    color: Colors.textSecondary,
  },
  inactiveSubtext: {
    color: Colors.textSecondary + "80",
  },
});

export default BaseMedicationCard;
