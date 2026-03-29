import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddMedicationButton from "../components/AddMedicationButton";
import PillBottleIcon from "../assets/icons/pill-bottle.svg";
import MedInfoCard from "../components/MedInfoCard";
import { useMedicationStore } from "../store/medicationStore";
import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../types/navigation";

const MedsScreen = () => {
  const { medications, deleteMedication, setDraft } = useMedicationStore();
  const navigation = useNavigation<NavProp>();

  const handleEdit = (medicationId: string) => {
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    setDraft(med);
    navigation.navigate("AddMedication", {
      screen: "Step1",
      params: { mode: "edit", medicationId },
    });
  };

  const handleDelete = (medicationId: string, name: string) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteMedication(medicationId),
          style: "destructive",
        },
      ],
    );
  };

  const formatSchedule = (med: (typeof medications)[0]) => {
    if (!med.schedule) return "No schedule";

    const { type, days } = med.schedule;
    const typeLabels: Record<string, string> = {
      daily: "Daily",
      weekly: days ? `${days.length}x per week` : "Weekly",
      biweekly: "Every 2 weeks",
      monthly: "Monthly",
      specificmonth: days ? `${days.length}x per month` : "Monthly",
      interval: `Every ${med.schedule.interval} days`,
      prn: "As needed",
    };

    return typeLabels[type] || type;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MedInfoCard
            medication={item}
            scheduleLabel={formatSchedule(item)}
            onEdit={() => handleEdit(item.id!)}
            onDelete={() => handleDelete(item.id!, item.name)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>My Medications</Text>
            {medications && (
              <Text style={styles.subHeaderText}>
                {medications.length}{" "}
                {medications.length === 1 ? "medication" : "medications"}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke="#757575"
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>No medications found</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first medication
            </Text>
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
  listContent: {
    padding: 24,
    paddingBottom: 56,
  },
  headerContainer: {
    paddingBottom: 24,
    alignItems: "center",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  subHeaderText: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#757575",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});

export default MedsScreen;
