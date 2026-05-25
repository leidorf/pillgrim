import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "../../../components/Text";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type NextButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

const NextButton = ({ disabled = false, onPress }: NextButtonProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme: Theme) => StyleSheet.create({
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.primaryDark,
    borderRadius: 16,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: theme.background,
    borderWidth: 1.5,
    padding: 14.5,
    borderColor: theme.border,
  },
  text: {
    color: theme.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  disabledText: {
    color: theme.textSecondary,
  },
});
