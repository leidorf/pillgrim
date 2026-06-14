import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import ArrowDownIcon from "../../../assets/icons/arrow-down.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type DropdownProps = {
  selectedLabel: string | undefined;
  onPress: () => void;
  disabled?: boolean;
};

type SettingRowProps = {
  label: string;
  description: string;
  children?: React.ReactNode;
  dropdown?: DropdownProps;
  onPress?: () => void;
};

export const SettingRow = ({
  label,
  description,
  children,
  dropdown,
  onPress,
}: SettingRowProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.info}
        onPress={onPress}
        disabled={!onPress}
      >
        <Text
          style={[
            styles.label,
            dropdown?.disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.description,
            dropdown?.disabled && styles.descriptionDisabled,
          ]}
        >
          {description}
        </Text>
      </Pressable>
      {dropdown ? (
        <Pressable
          style={[
            styles.dropdownTrigger,
            dropdown.disabled && styles.dropdownTriggerDisabled,
          ]}
          onPress={dropdown.disabled ? undefined : dropdown.onPress}
        >
          <Text
            style={[
              styles.dropdownTriggerText,
              dropdown.disabled && styles.dropdownTriggerTextDisabled,
            ]}
          >
            {dropdown.selectedLabel}
          </Text>
          <ArrowDownIcon
            width={16}
            height={16}
            stroke={
              dropdown.disabled
                ? theme.textSecondary + "40"
                : theme.textSecondary
            }
          />
        </Pressable>
      ) : (
        children
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.textSecondary + "15",
    },
    info: { flex: 1, marginRight: 16 },
    label: { color: theme.textPrimary, fontSize: 15, fontWeight: "600" },
    labelDisabled: { color: theme.textSecondary + "50" },
    description: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    descriptionDisabled: { color: theme.textSecondary + "30" },
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
    dropdownTriggerTextDisabled: {
      color: theme.textSecondary + "50",
    },
    dropdownTriggerDisabled: {
      backgroundColor: theme.surface + "50",
    },
  });
