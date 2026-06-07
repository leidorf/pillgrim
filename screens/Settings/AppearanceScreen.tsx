import { useMemo, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { Theme, ThemeMode } from "../../constants/theme";
import { useSettingsStore } from "../../store/settingsStore";
import { WEEKDAY_LABELS } from "../../constants/schedules";
import { DropdownModal } from "../../components/DropdownModal";
import { SettingRow } from "./components/SettingRow";
import { FontScale } from "../../theme/typography";
import { useAppTheme } from "../../theme/useAppTheme";

const FONT_SCALE_OPTIONS: { value: FontScale; labelKey: string }[] = [
  { value: "small", labelKey: "fontScale.small" },
  { value: "normal", labelKey: "fontScale.normal" },
  { value: "large", labelKey: "fontScale.large" },
  { value: "xlarge", labelKey: "fontScale.xlarge" },
];

const THEME_OPTIONS: { value: ThemeMode; labelKey: string }[] = [
  { value: "system", labelKey: "appearance.system" },
  { value: "light", labelKey: "appearance.light" },
  { value: "dark", labelKey: "appearance.dark" },
];

const AppearanceScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { timeFormat, setTimeFormat } = useSettingsStore();
  const { weekStartsOn, setWeekStartsOn } = useSettingsStore();
  const { fontScale, setFontScale } = useSettingsStore();
  const { themeMode, setThemeMode } = useSettingsStore();
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const fontOptions = useMemo(
    () => FONT_SCALE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const themeOptions = useMemo(
    () => THEME_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const weekdayOptions = useMemo(
    () =>
      WEEKDAY_LABELS.map((d) => ({
        value: d.value,
        label: t(d.labelKey),
      })),
    [t],
  );

  const selectedWeekLabel = useMemo(() => {
    const day = WEEKDAY_LABELS.find((d) => d.value === weekStartsOn);
    return day ? t(day.labelKey) : "";
  }, [weekStartsOn, t]);

  const selectedFontLabel = t(
    FONT_SCALE_OPTIONS.find((f) => f.value === fontScale)?.labelKey ??
      "fontScale.normal",
  );

  // Live time preview for the switch description
  const timePreview = useMemo(() => {
    const now = new Date();
    const h24 = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    if (timeFormat === "24h") return h24 + ":" + m;
    const h12 = now.getHours() % 12 || 12;
    const ampm = now.getHours() < 12 ? "AM" : "PM";
    return h12 + ":" + m + " " + ampm;
  }, [timeFormat]);

  const switchTrackColor = {
    false: theme.textSecondary + "40",
    true: theme.primary,
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("appearance.title")} />
      <View style={styles.container}>
        {/* ---------------------------- 24 Hour Format ---------------------------- */}
        <SettingRow
          label={t("appearance.timeFormat")}
          description={timePreview}
        >
          <Switch
            value={timeFormat === "24h"}
            onValueChange={(v: boolean) => setTimeFormat(v ? "24h" : "12h")}
            trackColor={{
              false: switchTrackColor.false,
              true: switchTrackColor.true,
            }}
            thumbColor={timeFormat === "24h" ? "#fff" : "#f4f3f4"}
          />
        </SettingRow>

        {/* --------------------------------- Theme ---------------------------------- */}
        <SettingRow
          label={t("appearance.theme")}
          description={t("appearance.themeDesc")}
          dropdown={{
            selectedLabel: t(
              THEME_OPTIONS.find((o) => o.value === themeMode)?.labelKey ??
                "appearance.system",
            ),
            onPress: () => setThemeDropdownOpen(true),
          }}
        />

        {/* ----------------------------- Week Starts On ----------------------------- */}
        <SettingRow
          label={t("appearance.weekStart")}
          description={t("appearance.weekStartDesc")}
          dropdown={{
            selectedLabel: selectedWeekLabel ?? "",
            onPress: () => setWeekDropdownOpen(true),
          }}
        />

        {/* ------------------------------- Font Size ------------------------------- */}
        <SettingRow
          label={t("appearance.fontSize")}
          description={t("appearance.fontSizeDesc")}
          dropdown={{
            selectedLabel: selectedFontLabel,
            onPress: () => setFontDropdownOpen(true),
          }}
        />
      </View>

      {/* --------------------------- Week Start Dropdown -------------------------- */}
      <DropdownModal
        visible={weekDropdownOpen}
        title={t("appearance.weekStart")}
        options={weekdayOptions}
        selectedValue={weekStartsOn}
        onSelect={(val) => setWeekStartsOn(val)}
        onClose={() => setWeekDropdownOpen(false)}
      />

      {/* --------------------------- Font Size Dropdown --------------------------- */}
      <DropdownModal
        visible={fontDropdownOpen}
        title={t("appearance.fontSize")}
        options={fontOptions}
        selectedValue={fontScale}
        onSelect={(val) => setFontScale(val)}
        onClose={() => setFontDropdownOpen(false)}
      />

      {/* ----------------------------- Theme Dropdown ------------------------------ */}
      <DropdownModal
        visible={themeDropdownOpen}
        title={t("appearance.theme")}
        options={themeOptions}
        selectedValue={themeMode}
        onSelect={(val) => setThemeMode(val)}
        onClose={() => setThemeDropdownOpen(false)}
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { paddingHorizontal: 24 },
  });

export default AppearanceScreen;
