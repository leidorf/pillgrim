import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { Colors } from "../../../../constants/theme";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export const StockInput = ({ value, onChange }: Props) => {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    onChange(text.replace(/[^0-9]/g, ""));
  };

  const count = parseInt(value || "0");
  const unitLabel = count === 1 ? "unit left" : "units left";

  return (
    <Pressable style={styles.container} onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder="0"
        keyboardType="number-pad"
        placeholderTextColor={Colors.textSecondary}
        maxLength={4}
      />
      <Text style={styles.label}>{unitLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});