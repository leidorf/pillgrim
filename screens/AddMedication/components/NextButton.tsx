import { Pressable, StyleSheet, Text } from "react-native";
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
      <Text style={styles.buttonText}>Next</Text>
    </Pressable>
  );
};

export default NextButton;

const styles = StyleSheet.create({
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  buttonText: { color: Colors.textPrimary, fontSize: 18, fontWeight: 600 },
  disabledButton: { backgroundColor: Colors.surface, opacity: 0.5 },
});
