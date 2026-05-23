import { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import PillIcon from "../../../../assets/icons/pill.svg";
import { MED_FORMS } from "../../../../constants/medication-forms";
import { Colors } from "../../../../constants/theme";
import { Medication } from "../../../../types/medication";

type Props = {
  value: Medication["form"];
  onChange: (form: Medication["form"]) => void;
};

export const MedicationFormPicker = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const SelectedIcon = MED_FORMS.find((f) => f.id === value)?.Icon ?? PillIcon;

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: false,
      bounciness: 6,
    }).start();
  };

  const handleSelect = (formId: string) => {
    onChange(formId as Medication["form"]);
    toggle();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.iconButton} onPress={toggle}>
        <SelectedIcon width={48} height={48} stroke={Colors.textPrimary} />
      </Pressable>

      <Text style={styles.formLabel}>{value}</Text>

      <Animated.View
        style={[
          styles.picker,
          {
            opacity: slideAnim,
            maxHeight: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            marginTop: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 16],
            }),
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pickerContent}
        >
          {MED_FORMS.map(({ id, label, Icon }) => {
            const isSelected = value === id;
            return (
              <Pressable
                key={id}
                style={[styles.formItem, isSelected && styles.formItemSelected]}
                onPress={() => handleSelect(id)}
              >
                <Icon
                  width={28}
                  height={28}
                  stroke={isSelected ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.formItemLabel,
                    isSelected && styles.formItemLabelSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  iconButton: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  formLabel: {
    textTransform: "capitalize",
    marginTop: 8,
    textAlign: "center",
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 18,
  },
  picker: {
    width: "100%",
    overflow: "hidden",
  },
  pickerContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  formItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginRight: 8,
    minWidth: 64,
  },
  formItemSelected: {
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  formItemLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  formItemLabelSelected: {
    color: Colors.primaryDark,
    fontWeight: "600",
  },
});
