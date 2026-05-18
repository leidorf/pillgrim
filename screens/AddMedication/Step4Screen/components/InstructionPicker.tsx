import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../../../../constants/theme";

import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import CheckIcon from "../../../../assets/icons/check.svg";

const INSTRUCTION_OPTIONS = [
  { id: "before_meal", label: "Before meal" },
  { id: "with_meal", label: "With meal" },
  { id: "after_meal", label: "After meal" },
  { id: "empty_stomach", label: "Empty stomach" },
  { id: "any", label: "Doesn't matter" },
  { id: "other", label: "Other (specify)" },
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

  const triggerLabel = selected
    ? (INSTRUCTION_OPTIONS.find((o) => o.id === selected)?.label ??
      "Select instruction...")
    : "Select instruction...";

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
        <ArrowDownIcon width={20} height={20} stroke={Colors.textSecondary} />
      </Pressable>

      {/* ---------------------------- Custom Text Input --------------------------- */}
      {selected === "other" && (
        <TextInput
          style={styles.customInput}
          value={customText}
          onChangeText={onCustomTextChange}
          placeholder="Enter specific instructions..."
          placeholderTextColor={Colors.textSecondary}
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
              <Text style={styles.menuTitle}>Select Instructions</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
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
                      {item.label}
                    </Text>
                    {isSelected && (
                      <CheckIcon
                        width={16}
                        height={16}
                        stroke={Colors.primary}
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

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  triggerText: { color: Colors.textPrimary, fontSize: 15, fontWeight: "500" },
  placeholder: { color: Colors.textSecondary },
  customInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surface,
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
    borderBottomColor: Colors.textSecondary + "20",
  },
  menuTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "600" },
  doneButton: { color: Colors.primary, fontSize: 16, fontWeight: "600" },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemActive: { backgroundColor: Colors.primary + "10" },
  menuItemText: { color: Colors.textPrimary, fontSize: 16 },
  menuItemTextActive: { color: Colors.primary, fontWeight: "600" },
  checkmark: { color: Colors.primary, fontSize: 18, fontWeight: "600" },
});
