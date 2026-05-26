import { useMemo, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Text } from "../../../../components/Text";

import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import CheckIcon from "../../../../assets/icons/check.svg";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

const INSTRUCTION_OPTIONS = [
  { id: "before_meal", label: "Before meal", labelKey: "instructions.beforeMeal" },
  { id: "with_meal", label: "With meal", labelKey: "instructions.withMeal" },
  { id: "after_meal", label: "After meal", labelKey: "instructions.afterMeal" },
  { id: "empty_stomach", label: "Empty stomach", labelKey: "instructions.emptyStomach" },
  { id: "any", label: "Doesn't matter", labelKey: "instructions.any" },
  { id: "other", label: "Other (specify)", labelKey: "instructions.other" },
] as const;

export type InstructionOption = (typeof INSTRUCTION_OPTIONS)[number]["id"];

type Props = {
  selected: InstructionOption | null;
  customText: string;
  onSelect: (id: InstructionOption) => void;
  onCustomTextChange: (text: string) => void;
};

export const InstructionPicker = ({
  selected,
  customText,
  onSelect,
  onCustomTextChange,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: isOpen ? 200 : 150,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const triggerLabel = selected
    ? (INSTRUCTION_OPTIONS.find((o) => o.id === selected)?.labelKey
        ? t(INSTRUCTION_OPTIONS.find((o) => o.id === selected)!.labelKey!)
        : INSTRUCTION_OPTIONS.find((o) => o.id === selected)?.label ?? "")
    : t("instructions.selectInstruction");

  const handleSelect = (id: InstructionOption) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* --------------------------------- Trigger -------------------------------- */}
      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {triggerLabel}
        </Text>
        <ArrowDownIcon width={20} height={20} stroke={theme.textSecondary} />
      </Pressable>

      {/* ---------------------------- Custom Text Input --------------------------- */}
      {selected === "other" && (
        <TextInput
          style={styles.customInput}
          value={customText}
          onChangeText={onCustomTextChange}
          placeholder={t("addMedication.instructionsPlaceholder")}
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={200}
        />
      )}

      {/* ----------------------------- Dropdown Modal ----------------------------- */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Animated.View
            style={[
              styles.menu,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>{t("instructions.title")}</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.doneButton}>{t("common.done")}</Text>
              </Pressable>
            </View>

            <FlatList
              data={INSTRUCTION_OPTIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selected === item.id;
                return (
                  <Pressable
                    style={[
                      styles.menuItem,
                      isSelected && styles.menuItemActive,
                    ]}
                    onPress={() => handleSelect(item.id)}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        isSelected && styles.menuItemTextActive,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                    {isSelected && (
                      <CheckIcon
                        width={16}
                        height={16}
                        stroke={theme.primary}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  trigger: {
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  triggerText: { color: theme.textPrimary, fontSize: 15, fontWeight: "500" },
  placeholder: { color: theme.textSecondary },
  customInput: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 14,
    color: theme.textPrimary,
    fontSize: 15,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  menu: {
    backgroundColor: theme.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingTop: 16,
    paddingBottom: 24,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.textSecondary + "20",
  },
  menuTitle: { color: theme.textPrimary, fontSize: 18, fontWeight: "600" },
  doneButton: { color: theme.primaryDark, fontSize: 16, fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemActive: { backgroundColor: theme.primary + "10" },
  menuItemText: { color: theme.textPrimary, fontSize: 16 },
  menuItemTextActive: { color: theme.primaryDark, fontWeight: "600" },
});
