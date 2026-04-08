import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { Colors } from "../../constants/theme";
import { useSettingsStore } from "../../store/settingsStore";

const AppearanceScreen = () => {
  const { timeFormat, setTimeFormat } = useSettingsStore();
  return (
    <ScreenLayout>
      <ScreenHeader title="Appearance" />
      <View style={styles.container}>
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
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "15",
  },
  settingInfo: { flex: 1, marginRight: 16 },
  settingLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
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
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#fff",
  },
});

export default AppearanceScreen;
