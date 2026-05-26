import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import CheckIcon from "../assets/icons/check.svg";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";

export type DropdownOption<T = string> = {
  value: T;
  label: string;
};

type DropdownModalProps<T> = {
  visible: boolean;
  title: string;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

export const DropdownModal = <T extends string | number>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: DropdownModalProps<T>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.separator} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {options.map((option) => {
              const isActive = option.value === selectedValue;
              return (
                <Pressable
                  key={String(option.value)}
                  style={[styles.item, isActive && styles.itemActive]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[styles.itemText, isActive && styles.itemTextActive]}
                  >
                    {option.label}
                  </Text>
                  {isActive && (
                    <CheckIcon width={16} height={16} stroke={theme.primary} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.surfaceElevated,
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
    title: {
      fontWeight: "700",
      color: theme.textPrimary,
      paddingHorizontal: 4,
      fontSize: 18,
    },
    separator: {
      height: 1,
      backgroundColor: theme.textSecondary + "20",
      marginVertical: 10,
    },
    content: { gap: 2 },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    itemActive: {
      backgroundColor: theme.primary + "10",
    },
    itemText: {
      color: theme.textPrimary,
      fontSize: 16,
    },
    itemTextActive: {
      color: theme.primaryDark,
      fontWeight: "600",
    },
  });
