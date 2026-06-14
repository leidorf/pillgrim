import { useMemo } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { SettingRow } from "./components/SettingRow";
import { useSettingsStore } from "../../store/settingsStore";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";
import { NotificationPermissionBanner } from "./components/NotificationPermissionBanner";

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hideNotificationNames = useSettingsStore(
    (s) => s.hideNotificationNames,
  );
  const setHideNotificationNames = useSettingsStore(
    (s) => s.setHideNotificationNames,
  );
  const switchColors = {
    trackColor: { false: theme.textSecondary + "40", true: theme.primary },
    thumbColor: "#fff" as string,
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.notifications")} />
      <View style={styles.container}>
        <NotificationPermissionBanner />

        <SettingRow
          label={t("settings.hideNotificationNames")}
          description={
            hideNotificationNames
              ? t("settings.hideNotificationNamesDescHidden")
              : t("settings.hideNotificationNamesDesc")
          }
          onPress={() => setHideNotificationNames(!hideNotificationNames)}
        >
          <Switch
            value={hideNotificationNames}
            onValueChange={setHideNotificationNames}
            {...switchColors}
            thumbColor={
              hideNotificationNames ? switchColors.thumbColor : "#f4f3f4"
            }
          />
        </SettingRow>
      </View>
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
  });

export default NotificationsScreen;
