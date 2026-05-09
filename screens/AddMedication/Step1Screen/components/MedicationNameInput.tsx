import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../../../constants/theme";

type Props = {
  value: string;
  onChange: (text: string) => void;
  error?: string;
};

export const MedicationNameInput = ({ value, onChange, error }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>Medication Name</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Medication Name"
      placeholderTextColor={Colors.textSecondary}
      value={value}
      onChangeText={onChange}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    fontSize: 16,
    textAlign: "center",
    color: Colors.textPrimary,
  },
  error: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: Colors.error,
  },
});
