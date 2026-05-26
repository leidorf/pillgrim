import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { Theme, ThemeMode } from "../../constants/theme";
import { useSettingsStore } from "../../store/settingsStore";
import { WEEKDAY_LABELS } from "../../constants/schedules";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import { DropdownModal } from "../../components/DropdownModal";
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
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Time Format</Text>
            <Text style={styles.settingDescription}>
              How times are displayed across the app
            </Text>
          </View>
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
        </View>

        {/* --------------------------------- Theme ---------------------------------- */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingDescription}>
              Choose between light, dark, or system default
            </Text>
          </View>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setThemeDropdownOpen(true)}
          >
            <Text style={styles.dropdownTriggerText}>
              {THEME_OPTIONS.find((o) => o.value === themeMode)?.label ||
                "System"}
            </Text>
            <ArrowDownIcon
              width={16}
              height={16}
              stroke={theme.textSecondary}
            />
          </Pressable>
        </View>

        {/* ----------------------------- Week Starts On ----------------------------- */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Week starts on</Text>
            <Text style={styles.settingDescription}>
              First day of the week in calendars
            </Text>
          </View>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setWeekDropdownOpen(true)}
          >
            <Text style={styles.dropdownTriggerText}>{selectedWeekLabel}</Text>
            <ArrowDownIcon
              width={16}
              height={16}
              stroke={theme.textSecondary}
            />
          </Pressable>
        </View>

        {/* ------------------------------- Font Size ------------------------------- */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <Text style={styles.settingDescription}>
              Adjust the text size of the application
            </Text>
          </View>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setFontDropdownOpen(true)}
          >
            <Text style={styles.dropdownTriggerText}>{selectedFontLabel}</Text>
            <ArrowDownIcon
              width={16}
              height={16}
              stroke={theme.textSecondary}
            />
          </Pressable>
        </View>
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
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.textSecondary + "15",
    },
    settingInfo: { flex: 1, marginRight: 16 },
    settingLabel: { color: theme.textPrimary, fontSize: 15, fontWeight: "600" },
    settingDescription: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
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
    dropdownTrigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 120,
      justifyContent: "space-between",
    },
    dropdownTriggerText: {
      color: theme.textPrimary,
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default AppearanceScreen;
