import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/Text";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import SkipIcon from "../../../assets/icons/circle-minus.svg";
import ClockIcon from "../../../assets/icons/clock.svg";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg";
import { Theme } from "../../../constants/theme";
import { useAppTheme } from "../../../theme/useAppTheme";

export const ManageMock = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.medName}>{t("onboarding.mockMedication")}</Text>
        <Text style={styles.medTime}>19:17</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.success + "20" },
            ]}
          >
            <CheckIcon width={20} height={20} color={theme.success} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionLabel}>
              {t("medicationAction.markAsTaken")}
            </Text>
            <Text style={styles.actionSub}>
              {t("medicationAction.recordDose")}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.textSecondary + "20" },
            ]}
          >
            <SkipIcon width={20} height={20} stroke={theme.textSecondary} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionLabel}>
              {t("medicationAction.skipDose")}
            </Text>
            <Text style={styles.actionSub}>
              {t("medicationAction.intentionallySkip")}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.warning + "20" },
            ]}
          >
            <ClockIcon width={20} height={20} stroke={theme.warning} />
          </View>
          <View style={styles.actionTexts}>
            <Text style={styles.actionLabel}>
              {t("medicationAction.snooze")}
            </Text>
            <Text style={styles.actionSub}>
              {t("medicationAction.remindLater")}
            </Text>
          </View>
          <ChevronRightIcon width={20} height={20} stroke={theme.textPrimary} />
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    sheet: {
      width: 300,
      borderRadius: 24,
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.textSecondary + "40",
      marginBottom: 12,
    },
    header: {
      paddingBottom: 10,
    },
    medName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    medTime: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 8,
    },
    actions: {
      gap: 4,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 14,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTexts: {
      flex: 1,
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.textPrimary,
    },
    actionSub: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 1,
    },
  });
