import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";
import { useState } from "react";
import { Medication } from "../types/medication";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MedInfoCard from "../components/MedInfoCard";

const MedsScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Test",
      dose: "1 pill",
      schedule: "daily",
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
