import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../../constants/theme";

type Unit = { value: string; label: string };

type Props = {
  units: Unit[];
  selected: string;
  onSelect: (value: string) => void;
};

export const UnitSelector = ({ units, selected, onSelect }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>Select Unit</Text>
    <View style={styles.chips}>
      {units.map((unit) => {
        const isActive = selected === unit.value;
        return (
          <Pressable
            key={unit.value}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(unit.value)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {unit.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 12 },
  label: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
    minWidth: 64,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textPrimary, fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});
