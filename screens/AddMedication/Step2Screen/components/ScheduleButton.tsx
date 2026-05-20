import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import { Colors } from "../../../../constants/theme";
import { ScheduleType } from "../../../../types/schedule";

type Props = {
  id: ScheduleType;
  label: string;
  isSelected: boolean;
  onPress: (id: ScheduleType) => void;
  children?: React.ReactNode;
};

export const ScheduleButton = ({
  id,
  label,
  isSelected,
  onPress,
  children,
}: Props) => {
  return (
    <View>
      <Pressable
        style={[styles.button, isSelected && styles.buttonSelected]}
        onPress={() => onPress(id)}
      >
        <Text
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>

      {isSelected && children}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonSelected: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },
  label: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontSize: 16,
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
