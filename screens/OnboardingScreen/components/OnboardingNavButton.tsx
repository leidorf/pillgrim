import { Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../../../theme/useAppTheme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  hidden?: boolean;
  variant?: "primary" | "muted";
};

export const OnboardingNavButton = ({
  label,
  onPress,
  disabled = false,
  hidden = false,
  variant = "primary",
}: Props) => {
  const theme = useAppTheme();
  const color =
    disabled || variant === "muted" ? theme.textMuted : theme.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || hidden}
      hitSlop={12}
      pointerEvents={hidden ? "none" : "auto"}
      style={[styles.btn, hidden && styles.hidden]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: { minWidth: 64, justifyContent: "center" },
  hidden: { opacity: 0 },
  label: { fontSize: 15, fontWeight: "600" },
});