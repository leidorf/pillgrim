import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import { Medication } from "../types/medication";
import { MED_FORMS } from "../constants/medication-forms";
import { PropsWithChildren } from "react";
import { Theme } from "../constants/theme";
import { useAppTheme } from "../theme/useAppTheme";

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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
            stroke={isInactive ? theme.textSecondary : theme.textPrimary}
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

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: theme.surfaceElevated,
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
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  noteText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  doseText: {
    fontSize: 13,
    color: theme.primaryDark,
    fontWeight: "500",
    marginTop: 2,
  },
  inactiveContainer: {
    opacity: 0.6,
    backgroundColor: theme.surface,
  },
  inactiveText: {
    color: theme.textSecondary,
  },
  inactiveSubtext: {
    color: theme.textSecondary + "80",
  },
});

export default BaseMedicationCard;
