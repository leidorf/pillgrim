import { useState } from "react";
import { Pressable, StyleSheet, View, ScrollView, Modal } from "react-native";
import { Text } from "../../components/Text";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { Colors } from "../../constants/theme";
import { useSettingsStore } from "../../store/settingsStore";
import { WEEKDAY_LABELS } from "../../constants/schedules";
import CheckIcon from "../../assets/icons/check.svg";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import { FontScale } from "../../theme/typography";

const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
];

const AppearanceScreen = () => {
  const { timeFormat, setTimeFormat } = useSettingsStore();
  const { weekStartsOn, setWeekStartsOn } = useSettingsStore();
  const { fontScale, setFontScale } = useSettingsStore();
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  const selectedWeekLabel = WEEKDAY_LABELS.find(
    (d) => d.value === weekStartsOn,
  )?.label;

  const selectedFontLabel = FONT_SCALE_OPTIONS.find(
    (f) => f.value === fontScale,
  )?.label || "Normal";

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
              stroke={Colors.textSecondary}
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
              stroke={Colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* --------------------------- Week Start Dropdown -------------------------- */}
      <Modal
        visible={weekDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWeekDropdownOpen(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setWeekDropdownOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Week starts on</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownContent}
            >
              {WEEKDAY_LABELS.map((day) => {
                const isActive = weekStartsOn === day.value;
                return (
                  <Pressable
                    key={day.value}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setWeekStartsOn(day.value);
                      setWeekDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isActive && styles.dropdownItemTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                    {isActive && (
                      <CheckIcon
                        width={16}
                        height={16}
                        stroke={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* --------------------------- Font Size Dropdown --------------------------- */}
      <Modal
        visible={fontDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFontDropdownOpen(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setFontDropdownOpen(false)}
        >
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Font Size</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownContent}
            >
              {FONT_SCALE_OPTIONS.map((opt) => {
                const isActive = fontScale === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.dropdownItem,
                      isActive && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setFontScale(opt.value);
                      setFontDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isActive && styles.dropdownItemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isActive && (
                      <CheckIcon
                        width={16}
                        height={16}
                        stroke={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "15",
  },
  settingInfo: { flex: 1, marginRight: 16 },
  settingLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  segment: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  segmentTextActive: { color: "#fff" },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: "space-between",
  },
  dropdownTriggerText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dropdownCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: "100%",
    maxWidth: 280,
    maxHeight: 400,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dropdownContent: { gap: 2 },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemActive: { backgroundColor: Colors.primary + "10" },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  dropdownItemTextActive: { color: Colors.primary, fontWeight: "600" },
});

export default AppearanceScreen;
