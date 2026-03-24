import { Pressable, StyleSheet, Text, View } from "react-native";
import { MedicationProps } from "../types/medication";
import PillIcon from "../assets/icons/pill.svg";

const MedInfoCard = ({ id, name, dose, schedule, onToggle }: MedicationProps) => {
  return (
    <Pressable style={styles.container}>
      <View style={styles.gapView}>
        <PillIcon height={24} width={24} />
        <View>
          <Text style={styles.text}>{name}</Text>
          <Text style={styles.note}>
            {dose} | {schedule}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default MedInfoCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "white",
  },
  text: { fontSize: 20, fontWeight: 500 },
  timeText: { fontSize: 24, fontWeight: 600 },
  note: {
    color: "#757575",
    textTransform: "capitalize",
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
