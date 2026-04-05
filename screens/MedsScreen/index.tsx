import { useRef, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, View, Alert } from "react-native";
import AddMedicationButton from "../../components/AddMedicationButton";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import MedicationInfoCard from "./components/MedicationInfoCard";
import MedicationBottomSheet from "./components/MedicationBottomSheet";
import { useMedicationStore } from "../../store/medicationStore";
import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../../types/navigation";
import { Medication } from "../../types/medication";
import BottomSheet from "@gorhom/bottom-sheet";
import { Colors } from "../../constants/theme";
import ScreenLayout from "../../components/ScreenLayout";

const MedsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { medications, deleteMedication, setDraft, updateMedication } =
    useMedicationStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState("");

  const handleOpenSheet = useCallback((med: Medication) => {
    setSelectedMed(med);
    setSelectedScheduleLabel(formatSchedule(med));
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleEdit = useCallback(
    (medicationId: string) => {
      const med = medications.find((m) => m.id === medicationId);
      if (!med) return;

      setDraft(med);
      navigation.navigate("AddMedication", {
        screen: "Step1",
        params: { mode: "edit", medicationId },
      });
    },
    [medications, setDraft, navigation],
  );

  const handleDelete = useCallback(
    (medicationId: string, name: string) => {
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
    },
    [deleteMedication],
  );

  const handleToggleActive = useCallback(
    (id: string, isActive: boolean) => {
      updateMedication(id, { isActive });
    },
    [updateMedication],
  );

  const formatSchedule = (med: Medication) => {
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

  const handleEditFromSheet = useCallback(() => {
    if (selectedMed?.id) {
      handleEdit(selectedMed.id);
    }
  }, [selectedMed, handleEdit]);

  const handleDeleteFromSheet = useCallback(() => {
    if (selectedMed?.id && selectedMed?.name) {
      handleDelete(selectedMed.id, selectedMed.name);
    }
  }, [selectedMed, handleDelete]);

  return (
    <ScreenLayout>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MedicationInfoCard
            medication={item}
            isInactive={!item.isActive}
            onPress={() => handleOpenSheet(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>My Medications</Text>
            {medications.length > 0 && (
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
              stroke={Colors.textSecondary}
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>No medications found</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add your first medication
            </Text>
          </View>
        }
      />

      <MedicationBottomSheet
        ref={bottomSheetRef}
        medication={selectedMed}
        scheduleLabel={selectedScheduleLabel}
        onEdit={handleEditFromSheet}
        onDelete={handleDeleteFromSheet}
        onToggleActive={handleToggleActive}
      />

      <AddMedicationButton />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  headerContainer: {
    paddingBottom: 24,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  subHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default MedsScreen;
