import { useMemo, useState } from "react";
import { StyleSheet, Switch, Vibration, View } from "react-native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { SettingRow } from "./components/SettingRow";
import { DropdownModal } from "../../components/DropdownModal";
import { useSettingsStore } from "../../store/settingsStore";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";
import { VIBRATION_PATTERNS } from "../../services/notificationService";
import {
  SOUND_OPTIONS,
  NotificationSound,
} from "../../utils/notificationSounds";
import { SoundPreviewer } from "../../hooks/soundPreview";

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
  const [previewSound, setPreviewSound] = useState<NotificationSound | null>(
    null,
  );
  const patternOptions = useMemo(
    () =>
      PATTERN_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
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

  /* ------------------------ Preview handlers ------------------------ */
  const previewVibration = (pattern: VibrationPattern) => {
    if (!vibrationEnabled) return;
    const pat = VIBRATION_PATTERNS[pattern];
    if (pat) Vibration.vibrate(pat);
  };

  const handlePatternSelect = (val: string) => {
    const pattern = val as VibrationPattern;
    setVibrationPattern(pattern);
    previewVibration(pattern);
  };

  const handleSoundSelect = (val: string) => {
    const sound = val as NotificationSound;
    setNotificationSound(sound);
    setPreviewSound(sound);
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.alarm")} />
      <View style={styles.container}>
        {/* ---------------------------- Vibration On/Off ---------------------------- */}
        <SettingRow
          label={t("settings.vibration")}
          description={t("settings.vibrationDesc")}
        >
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            {...switchColors}
            thumbColor={vibrationEnabled ? switchColors.thumbColor : "#f4f3f4"}
          />
        </SettingRow>

        {/* ---------------------------- Vibration Pattern --------------------------- */}
        <SettingRow
          label={t("settings.vibrationPattern")}
          description={t("settings.vibrationPatternDesc")}
          dropdown={{
            selectedLabel: selectedPatternLabel,
            onPress: () => setPatternDropdownOpen(true),
            disabled: !vibrationEnabled,
          }}
        />

        {/* --------------------------- Notification Sound --------------------------- */}
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
        onSelect={handlePatternSelect}
        onClose={() => setPatternDropdownOpen(false)}
      />

      <DropdownModal
        visible={soundDropdownOpen}
        title={t("settings.notificationSound")}
        options={soundOptions}
        selectedValue={notificationSound}
        onSelect={handleSoundSelect}
        onClose={() => setSoundDropdownOpen(false)}
      />

      <SoundPreviewer
        sound={previewSound}
        onFinish={() => setPreviewSound(null)}
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
  });

export default AlarmScreen;
