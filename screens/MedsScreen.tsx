import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Button, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";

const MedsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Meds Screen</Text>
      <AddMedicationButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: StatusBar.currentHeight },
});

export default MedsScreen;
