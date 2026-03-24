import { useNavigation } from "@react-navigation/native";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { NavProp } from "../types/navigation";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AddMedicationButton = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("AddMedication", { screen: "Step1" })}
    >
      <Text style={styles.text}>Add medication</Text>
      <FontAwesome6 name="circle-plus" color="#689F38" size={24} />
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
