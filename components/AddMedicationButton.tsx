import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text } from "react-native";
import { NavProp } from "../types/navigation";
import CirclePlusIcon from "../assets/icons//circle-plus.svg";

const AddMedicationButton = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("AddMedication", { screen: "Step1" })}
    >
      <Text style={styles.text}>Add medication</Text>
      <CirclePlusIcon height={24} width={24} color="#689F38" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#C8DDB4",
    gap: 8,
  },
  text: {
    color: "#212121",
  },
});

export default AddMedicationButton;
