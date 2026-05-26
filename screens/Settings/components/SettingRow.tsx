import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import ArrowDownIcon from "../../../assets/icons/arrow-down.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type DropdownProps = {
  selectedLabel: string | undefined;
  onPress: () => void;
};

type SettingRowProps = {
  label: string;
  description: string;
  children?: React.ReactNode;
  dropdown?: DropdownProps;
};

export const SettingRow = ({
  label,
  description,
  children,
  dropdown,
}: SettingRowProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {dropdown ? (
        <Pressable style={styles.dropdownTrigger} onPress={dropdown.onPress}>
          <Text style={styles.dropdownTriggerText}>
            {dropdown.selectedLabel}
          </Text>
          <ArrowDownIcon
            width={16}
            height={16}
            stroke={theme.textSecondary}
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
    description: {
      color: theme.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
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
