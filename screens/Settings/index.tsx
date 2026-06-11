import { useNavigation } from "@react-navigation/native";
import { FlatList, Linking, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import { useTranslation } from "react-i18next";
import { NavProp, SettingsParamList } from "../../types/navigation";
import ScreenHeader from "./components/ScreenHeader";
import NavigationButton from "./components/NavigationButton";
import ScreenLayout from "../../components/ScreenLayout";
import { useAppTheme } from "../../theme/useAppTheme";
import { useMemo } from "react";
import { Theme } from "../../constants/theme";
import { NotificationPermissionBanner } from "./components/NotificationPermissionBanner";

type SettingEntry = {
  key: keyof SettingsParamList;
  labelKey: string;
};

const SETTINGS_ENTRIES: SettingEntry[] = [
  { key: "Notifications", labelKey: "settings.notifications" },
  { key: "Alarm", labelKey: "settings.alarm" },
  { key: "Appearance", labelKey: "settings.appearance" },
  { key: "Language", labelKey: "settings.language" },
];

const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleNavigation = (screenName: keyof SettingsParamList) => {
    navigation.navigate("Settings", { screen: screenName });
  };
  const handlePrivacy = () => {
    Linking.openURL("https://40ambar.dev/apps/medication-reminder/privacy");
  };
  const handleAbout = () => {
    Linking.openURL("https://40ambar.dev/");
  };
  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.title")} />
      <FlatList
        data={SETTINGS_ENTRIES}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NavigationButton
            title={t(item.labelKey)}
            onPress={() => handleNavigation(item.key)}
          />
        )}
        ListHeaderComponent={NotificationPermissionBanner}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text onPress={handlePrivacy} style={styles.footerText}>
              {t("settings.privacy")}
            </Text>
            <Text style={styles.footerText}> - </Text>
            <Text onPress={handleAbout} style={styles.footerText}>
              {t("settings.about")}
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 24,
      gap: 8,
    },
    footer: {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    footerText: {
      color: theme.textPrimary,
    },
  });

export default SettingsScreen;
