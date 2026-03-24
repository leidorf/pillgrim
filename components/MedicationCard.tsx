import { Pressable, StyleSheet, Text, View } from "react-native";
import { Medication, MedicationProps } from "../types/medication";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const MedicationCard = ({
  id,
  name,
  note,
  dose,
  time,
  isTaken = false,
  onToggle,
}: MedicationProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.gapView}>
        <FontAwesome6 name="pills" size={24} />
        <View>
          <Text style={styles.text}>{name}</Text>
          <Text style={styles.note}>({note})</Text>
        </View>
      </View>
      <Text style={styles.text}>{dose}</Text>
      <View style={styles.gapView}>
        <Text style={styles.timeText}>{time}</Text>
        <Pressable onPress={() => id && onToggle?.(id)}>
          {isTaken ? (
            <FontAwesome6 name="circle-check" size={24} color="#689F38" />
          ) : (
            <View style={styles.radioButton} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default MedicationCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "white",
  },
  text: { fontSize: 20, fontWeight: 500 },
  timeText: { fontSize: 24, fontWeight: 600 },
  note: {
    fontSize: 10,
    color: "#757575",
  },
  gapView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderColor: "#689F38",
    borderWidth: 2.5,
    borderStyle: "solid",
    borderRadius: 24,
  },
});
