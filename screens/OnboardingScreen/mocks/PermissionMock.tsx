import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/Text";
import BellOffIcon from "../../../assets/icons/bell-off.svg";
import { Theme } from "../../../constants/theme";
import { useAppTheme } from "../../../theme/useAppTheme";

export const PermissionMock = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.screenTitle}>{t("settings.title")}</Text>

      <View
        style={[
          styles.banner,
          {
            backgroundColor: theme.warning + "20",
            borderColor: theme.warning,
          },
        ]}
      >
        <BellOffIcon width={24} height={24} stroke={theme.warning} />
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: theme.warning }]}>
            {t("settings.exactAlarmDisabled")}
          </Text>
          <Text
            style={[styles.bannerSub, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {t("settings.exactAlarmOpenSettings")}
          </Text>
        </View>
      </View>

      <View style={styles.fillerRow} />
      <View style={styles.fillerRow} />
      <View style={styles.fillerRow} />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: 300,
      padding: 20,
      borderRadius: 24,
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
      gap: 12,
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 15, fontWeight: "600" },
    bannerSub: { fontSize: 13, marginTop: 2 },
    fillerRow: {
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.textSecondary + "12",
    },
  });
