import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "../../../../components/Text";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Props = {
  formattedTime: string;
  onOpenTimePicker: () => void;
};

export const TimeSection = ({ formattedTime, onOpenTimePicker }: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable style={styles.timeButton} onPress={onOpenTimePicker}>
      <Text style={styles.timeText}>{formattedTime}</Text>
      <Text style={styles.timeHint}>{t("addMedication.tapToChangeTime")}</Text>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    timeButton: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: theme.textSecondary + "30",
    },
    timeText: { color: theme.textPrimary, fontWeight: "700", fontSize: 30 },
    timeHint: { color: theme.textSecondary, fontSize: 12 },
  });