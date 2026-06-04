import { useMemo } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { SettingRow } from "./components/SettingRow";
import { useSettingsStore } from "../../store/settingsStore";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hideNotificationNames = useSettingsStore((s) => s.hideNotificationNames);
  const setHideNotificationNames = useSettingsStore(
    (s) => s.setHideNotificationNames,
  );
  const fullscreenNotification = useSettingsStore(
    (s) => s.fullscreenNotification,
  );
  const setFullscreenNotification = useSettingsStore(
    (s) => s.setFullscreenNotification,
  );

  const switchColors = {
    trackColor: { false: theme.textSecondary + "40", true: theme.primary },
    thumbColor: "#fff" as string,
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.notifications")} />
      <View style={styles.container}>
        <SettingRow
          label={t("settings.fullscreenNotification")}
          description={t("settings.fullscreenNotificationDesc")}
        >
          <Switch
            value={fullscreenNotification}
            onValueChange={setFullscreenNotification}
            {...switchColors}
            thumbColor={
              fullscreenNotification
                ? switchColors.thumbColor
                : "#f4f3f4"
            }
          />
        </SettingRow>

        <SettingRow
          label={t("settings.hideNotificationNames")}
          description={t("settings.hideNotificationNamesDesc")}
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
