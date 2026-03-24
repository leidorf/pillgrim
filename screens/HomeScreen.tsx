import {
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";
import MedicationCard from "../components/MedicationCard";
import { useState } from "react";
import { Medication, MedicationLog } from "../types/medication";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
0
const HomeScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Test",
      note: "After Meal",
      dose: "1 pill",
      time: "16:00",
      isTaken: false,
    },
  ]);

  const [logs, setLogs] = useState<MedicationLog[]>([]);

  const handleToggle = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id !== id) return med;
        const newTaken = !med.isTaken;

        setLogs((prevLogs) => [
          ...prevLogs,
          {
            medicationId: id,
            takenAt: new Date(),
            action: newTaken ? "taken" : "untaken",
          },
        ]);
        return { ...med, isTaken: newTaken };
      }),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}></View>
      <FlatList
        style={styles.medList}
        data={medications}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => (
          <MedicationCard {...item} onToggle={handleToggle} />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View>
            <FontAwesome6
              name="prescription-bottle-medical"
              size={64}
              color="black"
            />
            <Text>No medications found</Text>
          </View>
        }
      />
      <AddMedicationButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  medList: {
    paddingHorizontal: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    backgroundColor: "#e0ead6",
  },
  box: {
    height: 240,
  },
});

export default HomeScreen;
