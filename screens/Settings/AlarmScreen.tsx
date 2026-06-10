import { useMemo, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { SettingRow } from "./components/SettingRow";
import { DropdownModal } from "../../components/DropdownModal";
import { useSettingsStore } from "../../store/settingsStore";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";
import {
  SOUND_OPTIONS,
  NotificationSound,
} from "../../utils/notificationSounds";

type VibrationPattern = "short" | "normal" | "long" | "alarm";

const PATTERN_OPTIONS: { value: VibrationPattern; labelKey: string }[] = [
  { value: "short", labelKey: "vibration.short" },
  { value: "normal", labelKey: "vibration.normal" },
  { value: "long", labelKey: "vibration.long" },
  { value: "alarm", labelKey: "vibration.alarm" },
];

const AlarmScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled);
  const vibrationPattern = useSettingsStore((s) => s.vibrationPattern);
  const setVibrationPattern = useSettingsStore((s) => s.setVibrationPattern);
  const notificationSound = useSettingsStore((s) => s.notificationSound);
  const setNotificationSound = useSettingsStore((s) => s.setNotificationSound);

  const [patternDropdownOpen, setPatternDropdownOpen] = useState(false);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);

  const patternOptions = useMemo(
    () => PATTERN_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const soundOptions = useMemo(
    () => SOUND_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const selectedPatternLabel = t(
    PATTERN_OPTIONS.find((o) => o.value === vibrationPattern)?.labelKey ??
      "vibration.normal",
  );

  const selectedSoundLabel = t(
    SOUND_OPTIONS.find((o) => o.value === notificationSound)?.labelKey ??
      "sound.default",
  );

  const switchColors = {
    trackColor: { false: theme.textSecondary + "40", true: theme.primary },
    thumbColor: "#fff" as string,
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.alarm")} />
      <View style={styles.container}>
        {/* --------------------------- Vibration On/Off --------------------------- */}
        <SettingRow
          label={t("settings.vibration")}
          description={t("settings.vibrationDesc")}
        >
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            {...switchColors}
            thumbColor={
              vibrationEnabled ? switchColors.thumbColor : "#f4f3f4"
            }
          />
        </SettingRow>

        {/* ------------------------- Vibration Pattern ------------------------- */}
        <SettingRow
          label={t("settings.vibrationPattern")}
          description={t("settings.vibrationPatternDesc")}
          dropdown={{
            selectedLabel: selectedPatternLabel,
            onPress: () => vibrationEnabled && setPatternDropdownOpen(true),
          }}
        />

        {/* ------------------------- Notification Sound ------------------------- */}
        <SettingRow
          label={t("settings.notificationSound")}
          description={t("settings.notificationSoundDesc")}
          dropdown={{
            selectedLabel: selectedSoundLabel,
            onPress: () => setSoundDropdownOpen(true),
          }}
        />
      </View>

      <DropdownModal
        visible={patternDropdownOpen}
        title={t("settings.vibrationPattern")}
        options={patternOptions}
        selectedValue={vibrationPattern}
        onSelect={(val) => setVibrationPattern(val as VibrationPattern)}
        onClose={() => setPatternDropdownOpen(false)}
      />

      <DropdownModal
        visible={soundDropdownOpen}
        title={t("settings.notificationSound")}
        options={soundOptions}
        selectedValue={notificationSound}
        onSelect={(val) => setNotificationSound(val as NotificationSound)}
        onClose={() => setSoundDropdownOpen(false)}
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
  });

export default AlarmScreen;
