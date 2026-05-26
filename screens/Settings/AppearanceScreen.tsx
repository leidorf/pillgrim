import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { Theme, ThemeMode } from "../../constants/theme";
import { useSettingsStore } from "../../store/settingsStore";
import { WEEKDAY_LABELS } from "../../constants/schedules";
import { DropdownModal } from "../../components/DropdownModal";
import { SettingRow } from "./components/SettingRow";
import { FontScale } from "../../theme/typography";
import { useAppTheme } from "../../theme/useAppTheme";

const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const AppearanceScreen = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { timeFormat, setTimeFormat } = useSettingsStore();
  const { weekStartsOn, setWeekStartsOn } = useSettingsStore();
  const { fontScale, setFontScale } = useSettingsStore();
  const { themeMode, setThemeMode } = useSettingsStore();
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const selectedWeekLabel = WEEKDAY_LABELS.find(
    (d) => d.value === weekStartsOn,
  )?.label;

  const selectedFontLabel =
    FONT_SCALE_OPTIONS.find((f) => f.value === fontScale)?.label || "Normal";

  return (
    <ScreenLayout>
      <ScreenHeader title="Appearance" />
      <View style={styles.container}>
        {/* ------------------------------- Time Format ------------------------------ */}
        <SettingRow
          label="Time Format"
          description="How times are displayed across the app"
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
                12h
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
                24h
              </Text>
            </Pressable>
          </View>
        </SettingRow>

        {/* --------------------------------- Theme ---------------------------------- */}
        <SettingRow
          label="Theme"
          description="Choose between light, dark, or system default"
          dropdown={{
            selectedLabel:
              THEME_OPTIONS.find((o) => o.value === themeMode)?.label ||
              "System",
            onPress: () => setThemeDropdownOpen(true),
          }}
        />

        {/* ----------------------------- Week Starts On ----------------------------- */}
        <SettingRow
          label="Week starts on"
          description="First day of the week in calendars"
          dropdown={{
            selectedLabel: selectedWeekLabel,
            onPress: () => setWeekDropdownOpen(true),
          }}
        />

        {/* ------------------------------- Font Size ------------------------------- */}
        <SettingRow
          label="Font Size"
          description="Adjust the text size of the application"
          dropdown={{
            selectedLabel: selectedFontLabel,
            onPress: () => setFontDropdownOpen(true),
          }}
        />
      </View>

      {/* --------------------------- Week Start Dropdown -------------------------- */}
      <DropdownModal
        visible={weekDropdownOpen}
        title="Week starts on"
        options={WEEKDAY_LABELS}
        selectedValue={weekStartsOn}
        onSelect={(val) => setWeekStartsOn(val)}
        onClose={() => setWeekDropdownOpen(false)}
      />

      {/* --------------------------- Font Size Dropdown --------------------------- */}
      <DropdownModal
        visible={fontDropdownOpen}
        title="Font Size"
        options={FONT_SCALE_OPTIONS}
        selectedValue={fontScale}
        onSelect={(val) => setFontScale(val)}
        onClose={() => setFontDropdownOpen(false)}
      />

      {/* ----------------------------- Theme Dropdown ------------------------------ */}
      <DropdownModal
        visible={themeDropdownOpen}
        title="Theme"
        options={THEME_OPTIONS}
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
