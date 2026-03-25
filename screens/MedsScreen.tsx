import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";
import { useState } from "react";
import { Medication } from "../types/medication";
import PillBottleIcon from "../assets/icons/pill-bottle.svg";
import MedInfoCard from "../components/MedInfoCard";

const MedsScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Test",
      dose: "1 pill",
    },
  ]);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => <MedInfoCard {...item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Medications</Text>
          </View>
        }
        ListEmptyComponent={
          <View>
            <PillBottleIcon
              height={64}
              width={64}
              stroke="#000000"
              strokeWidth={1}
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
    paddingHorizontal: 32,
  },
  headerContainer: { paddingBottom: 16 },
  headerText: {
    fontSize: 32,
    fontWeight: 600,
    textAlign: "center",
  },
});

export default MedsScreen;
