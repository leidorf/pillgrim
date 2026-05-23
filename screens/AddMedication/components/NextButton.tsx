import { Pressable, StyleSheet } from "react-native";
import { Text } from "../../../components/Text";
import { Colors } from "../../../constants/theme";

type NextButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

const NextButton = ({ disabled = false, onPress }: NextButtonProps) => {
  return (
    <Pressable
      style={[styles.nextButton, disabled && styles.disabledButton]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        Next
      </Text>
    </Pressable>
  );
};

export default NextButton;

const styles = StyleSheet.create({
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    padding: 14.5,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  disabledText: {
    color: Colors.textSecondary,
  },
});
