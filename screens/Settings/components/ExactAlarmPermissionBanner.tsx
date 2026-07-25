import { useTranslation } from "react-i18next";
import { canScheduleExactAlarms } from "react-native-permissions";
import { useAppTheme } from "../../../theme/useAppTheme";
import { useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";
import * as Application from "expo-application";
import BellOffIcon from "../../../assets/icons/bell-off.svg";

export const ExactAlarmPermissionBanner = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const [canSchedule, setCanSchedule] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const check = async () => {
      try {
        const result = await canScheduleExactAlarms();
        setCanSchedule(result);
      } catch {
        setCanSchedule(true);
      }
    };
    check();
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") check();
    });
    return () => subscription.remove();
  }, []);

  if (Platform.OS !== "android" || canSchedule) return null;

  const handlePress = () => {
    Linking.sendIntent("android.settings.REQUEST_SCHEDULE_EXACT_ALARM", [
      { key: "package", value: Application.applicationId ?? "" },
    ]);
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
          {t("settings.exactAlarmDisabled")}
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          {t("settings.exactAlarmOpenSettings")}
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
