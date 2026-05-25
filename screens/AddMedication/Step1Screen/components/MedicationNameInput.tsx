import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "../../../../components/Text";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Props = {
  value: string;
  onChange: (text: string) => void;
  error?: string;
};

export const MedicationNameInput = ({ value, onChange, error }: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medication Name</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocus,
          error ? styles.inputError : null,
        ]}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    marginTop: 32,
  },
  label: {
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  input: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: theme.surface,
    textAlign: "center",
    color: theme.textPrimary,
    borderWidth: 1.5,
    borderColor: "transparent",
    fontSize: 16,
  },
  inputFocus: {
    borderColor: theme.primary,
  },
  inputError: {
    borderColor: theme.error,
  },
  error: {
    marginTop: 8,
    textAlign: "center",
    color: theme.error,
    fontSize: 14,
  },
});
