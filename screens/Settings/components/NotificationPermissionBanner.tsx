import { useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Text } from "../../../components/Text";
import BellOffIcon from "../../../assets/icons/bell-off.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PermissionStatus = "granted" | "denied" | "undetermined";

export const NotificationPermissionBanner = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [permStatus, setPermStatus] = useState<PermissionStatus>("granted");

  useEffect(() => {
    const checkPerm = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") {
        await AsyncStorage.removeItem("notification_permission_denied");
      }
      setPermStatus(status as PermissionStatus);
    };

    checkPerm();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") checkPerm();
    });

    return () => subscription.remove();
  }, []);

  if (permStatus === "granted") return null;

  const handlePress = async () => {
    if (permStatus === "denied") {
      if (Platform.OS === "ios") {
        Linking.openSettings();
      } else {
        Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
          {
            key: "android.provider.extra.APP_PACKAGE",
            value: Application.applicationId ?? "",
          },
        ]);
      }
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermStatus(status as PermissionStatus);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.banner,
        { backgroundColor: theme.warning + "20", borderColor: theme.warning },
      ]}
    >
      <BellOffIcon width={24} height={24} stroke={theme.warning} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.warning }]}>
          {t("settings.notificationsDisabled")}
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          {permStatus === "denied"
            ? t("settings.notificationsOpenSettings")
            : t("settings.notificationsGrant")}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 14, marginTop: 2 },
});
