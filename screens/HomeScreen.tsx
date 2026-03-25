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
import PillBottleIcon from "../assets/icons/pill-bottle.svg";
0;
const HomeScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Test",
      note: "After Meal",
      dose: "1 pill",
      times: ["16:00"],
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
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>No medications for today!</Text>
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
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 500,
  },
});

export default HomeScreen;
