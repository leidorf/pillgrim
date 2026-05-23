import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { NavProp } from "../types/navigation";
import { Colors } from "../constants/theme";
import CirclePlusIcon from "../assets/icons//circle-plus.svg";

const AddMedicationButton = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("AddMedication", { screen: "Step1" })}
    >
      <Text style={styles.text}>Add medication</Text>
      <CirclePlusIcon height={24} width={24} color={Colors.surface} />
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
    backgroundColor: Colors.primary,
    gap: 8,
  },
  text: {
    color: Colors.surface,
  },
});

export default AddMedicationButton;
