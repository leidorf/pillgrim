import { useEffect } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { Text } from "../../../../components/Text";
import BellIcon from "../../../../assets/icons/bell.svg";
import EyeOffIcon from "../../../../assets/icons/eye-off.svg";
import PackageIcon from "../../../../assets/icons/package.svg";
import { Colors } from "../../../../constants/theme";

export type NotificationSettings = {
  enabled: boolean;
  hideName: boolean;
  lowStockAlert: boolean;
};

type Props = {
  settings: NotificationSettings;
  hasStock: boolean;
  onChange: (settings: NotificationSettings) => void;
};

export const NotificationSettingsPanel = ({
  settings,
  hasStock,
  onChange,
}: Props) => {
  const toggle = (key: keyof NotificationSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  // Disable hideName when notifications are turned off
  useEffect(() => {
    if (!settings.enabled && settings.hideName) {
      onChange({ ...settings, hideName: false });
    }
  }, [settings.enabled]);

  return (
    <View style={styles.container}>
      {/* ---------------------------- Enable Reminders ---------------------------- */}
      <SettingRow
        icon={<BellIcon width={20} height={20} stroke={Colors.textPrimary} />}
        title="Enable reminders"
        description="Get notified when it's time"
        value={settings.enabled}
        onToggle={() => toggle("enabled")}
        withDivider
      />

      {/* -------------------------- Hide Medication Name -------------------------- */}
      <SettingRow
        icon={
          <EyeOffIcon
            width={20}
            height={20}
            stroke={
              settings.enabled ? Colors.textPrimary : Colors.textSecondary
            }
          />
        }
        title="Hide medication name"
        description='Show "Medication" instead of name'
        value={settings.hideName}
        onToggle={() => toggle("hideName")}
        disabled={!settings.enabled}
        withDivider
      />

      {/* ----------------------------- Low Stock Alert ---------------------------- */}
      <SettingRow
        icon={
          <PackageIcon
            width={20}
            height={20}
            stroke={hasStock ? Colors.textPrimary : Colors.textSecondary}
          />
        }
        title="Low stock alert"
        description={
          hasStock ? "Notify when running low" : "Enter stock to enable"
        }
        value={settings.lowStockAlert && hasStock}
        onToggle={() => toggle("lowStockAlert")}
        disabled={!hasStock}
      />
    </View>
  );
};

type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  withDivider?: boolean;
};

const SettingRow = ({
  icon,
  title,
  description,
  value,
  onToggle,
  disabled = false,
  withDivider = false,
}: SettingRowProps) => (
  <View
    style={[
      styles.row,
      withDivider && styles.rowDivider,
      disabled && styles.rowDisabled,
    ]}
  >
    <View style={styles.rowInfo}>
      {icon}
      <View>
        <Text style={[styles.rowTitle, disabled && styles.textDisabled]}>
          {title}
        </Text>
        <Text style={[styles.rowDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: Colors.textSecondary + "40", true: Colors.primary }}
      thumbColor={value ? "#fff" : "#f4f3f4"}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "15",
  },
  rowDisabled: { opacity: 0.5 },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  rowDescription: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  textDisabled: { color: Colors.textSecondary },
});
