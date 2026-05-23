import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "../../../../components/Text";
import { Colors } from "../../../../constants/theme";

type Props = {
  value: string;
  onChange: (text: string) => void;
  error?: string;
};

export const MedicationNameInput = ({ value, onChange, error }: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medication Name</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocus,
          error ? styles.inputError : null,
        ]}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    marginTop: 32,
  },
  label: {
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  input: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    textAlign: "center",
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: "transparent",
    fontSize: 16,
  },
  inputFocus: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    marginTop: 8,
    textAlign: "center",
    color: Colors.error,
    fontSize: 14,
  },
});
