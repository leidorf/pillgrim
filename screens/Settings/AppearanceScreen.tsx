import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
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

  return (
    <ScreenLayout>
      <ScreenHeader title={t("appearance.title")} />
      <View style={styles.container}>
        {/* ------------------------------- Time Format ------------------------------ */}
        <SettingRow
          label={t("appearance.timeFormat")}
          description={t("appearance.timeFormatDesc")}
        >
          <View style={styles.segmentedControl}>
            <Pressable
              style={[
                styles.segment,
                timeFormat === "12h" && styles.segmentActive,
              ]}
              onPress={() => setTimeFormat("12h")}
            >
              <Text
                style={[
                  styles.segmentText,
                  timeFormat === "12h" && styles.segmentTextActive,
                ]}
              >
                {t("appearance.12h")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segment,
                timeFormat === "24h" && styles.segmentActive,
              ]}
              onPress={() => setTimeFormat("24h")}
            >
              <Text
                style={[
                  styles.segmentText,
                  timeFormat === "24h" && styles.segmentTextActive,
                ]}
              >
                {t("appearance.24h")}
              </Text>
            </Pressable>
          </View>
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
    container: { paddingHorizontal: 16 },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 2,
    },
    segment: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
    segmentActive: { backgroundColor: theme.primaryDark },
    segmentText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    segmentTextActive: { color: theme.surfaceElevated },
  });

export default AppearanceScreen;
