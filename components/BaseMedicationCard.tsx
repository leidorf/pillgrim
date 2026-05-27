import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import { useTranslation } from "react-i18next";
import { Medication } from "../types/medication";
import { MED_FORMS } from "../constants/medication-forms";
import { PropsWithChildren } from "react";
import { Theme } from "../constants/theme";
import { useAppTheme } from "../theme/useAppTheme";
import { DEFAULT_UNITS, DOSE_UNITS_BY_FORM } from "../constants/units";

const UNIT_LABEL_KEY_MAP: Record<string, string | undefined> = {};
[...DEFAULT_UNITS, ...Object.values(DOSE_UNITS_BY_FORM).flat()].forEach((u) => {
  if (u.labelKey) UNIT_LABEL_KEY_MAP[u.value] = u.labelKey;
});

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

export const translateDose = (
  dose: string,
  t: (key: string) => string,
): string => {
  const parts = dose.split(" ");
  if (parts.length < 2) return dose;
  const amount = parts[0];
  const unitValue = parts.slice(1).join(" ");
  const labelKey = UNIT_LABEL_KEY_MAP[unitValue];
  return labelKey ? `${amount} ${t(labelKey)}` : dose;
};

export const formatNote = (
  note?: string,
  t?: (key: string) => string,
): string => {
  if (!note) return "";
  const noteMap: Record<string, string> = {
    before_meal: t ? t("instructions.beforeMeal") : "Before meal",
    with_meal: t ? t("instructions.withMeal") : "With meal",
    after_meal: t ? t("instructions.afterMeal") : "After meal",
    empty_stomach: t ? t("instructions.emptyStomach") : "Empty stomach",
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
  const { t } = useTranslation();
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
              {translateDose(dose, t)}
            </Text>
          )}

          {medication.note && (
            <Text
              style={[styles.noteText, isInactive && styles.inactiveSubtext]}
            >
              {formatNote(medication.note, t)}
            </Text>
          )}
        </View>
      </View>

      {children && <View style={styles.rightSection}>{children}</View>}
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
