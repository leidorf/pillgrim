import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { BackHandler, FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { Text } from "../../components/Text";
import AddMedicationButton from "../../components/AddMedicationButton";
import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import MedicationInfoCard from "./components/MedicationInfoCard";
import MedicationBottomSheet from "./components/MedicationBottomSheet";
import UndoSnackbar from "../../components/UndoSnackbar";
import BaseModal from "../../components/BaseModal";
import { useMedicationStore } from "../../store/medicationStore";
import { NavProp, MainScreenParamList } from "../../types/navigation";
import { Medication } from "../../types/medication";
import BottomSheet from "@gorhom/bottom-sheet";
import ScreenLayout from "../../components/ScreenLayout";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const MedsScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavProp>();
  const {
    medications,
    softDeleteMedication,
    undoSoftDelete,
    commitSoftDelete,
    setDraft,
    updateMedication,
  } = useMedicationStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [selectedScheduleLabel, setSelectedScheduleLabel] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    medicationId?: string;
    name?: string;
  }>({ visible: false });

  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    medicationId?: string;
    name?: string;
  }>({ visible: false });

  const handleOpenSheet = useCallback((med: Medication) => {
    setSelectedMed(med);
    setSelectedScheduleLabel(formatSchedule(med));
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetAnimate = useCallback(
    (_fromIndex: number, toIndex: number) => {
      setIsSheetOpen(toIndex >= 0);
    },
    [],
  );

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
      setDeleteModal({ visible: true, medicationId, name });
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    if (deleteModal.medicationId && deleteModal.name) {
      softDeleteMedication(deleteModal.medicationId);
      setSnackbar({
        visible: true,
        medicationId: deleteModal.medicationId,
        name: deleteModal.name,
      });
    }
    setDeleteModal({ visible: false });
  }, [deleteModal.medicationId, deleteModal.name, softDeleteMedication]);

  const handleUndoDelete = useCallback(() => {
    undoSoftDelete();
    setSnackbar({ visible: false });
  }, [undoSoftDelete]);

  const handleCommitDelete = useCallback(() => {
    commitSoftDelete();
    setSnackbar({ visible: false });
  }, [commitSoftDelete]);

  // Commit soft-delete on unmount (user navigated away while snackbar was visible)
  useEffect(() => {
    return () => {
      commitSoftDelete();
    };
  }, [commitSoftDelete]);

  const handleToggleActive = useCallback(
    (id: string, isActive: boolean) => {
      updateMedication(id, { isActive });
    },
    [updateMedication],
  );

  const formatSchedule = useCallback((med: Medication) => {
    if (!med.schedule) return t("medicationInfo.noSchedule");

    const { type, days } = med.schedule;

    switch (type) {
      case "daily":
        return t("medicationInfo.daily");
      case "weekly":
        return days
          ? t("medicationInfo.xPerWeek", { count: days.length })
          : t("schedules.weekly");
      case "biweekly":
        return t("schedules.biweekly");
      case "monthly":
        return t("schedules.monthly");
      case "specificmonth":
        return days
          ? t("medicationInfo.xPerMonth", { count: days.length })
          : t("schedules.monthly");
      case "interval":
        return t("medicationInfo.everyXDays", { interval: med.schedule.interval });
      case "prn":
        return t("schedules.prn");
      default:
        return type;
    }
  }, [t]);

  const handleEditFromSheet = useCallback(() => {
    if (selectedMed?.id) {
      setIsSheetOpen(false);
      handleEdit(selectedMed.id);
    }
  }, [selectedMed, handleEdit]);

  const handleDeleteFromSheet = useCallback(() => {
    if (selectedMed?.id && selectedMed?.name) {
      // Close the sheet first, then trigger soft-delete
      bottomSheetRef.current?.close();
      handleDelete(selectedMed.id, selectedMed.name);
    }
  }, [selectedMed, handleDelete]);

  const tabNavigation =
    useNavigation<BottomTabNavigationProp<MainScreenParamList>>();

  const visibleTabBarStyle = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderTopWidth: 0,
    boxShadow: "none",
    elevation: 0,
  } as const;

  // Hide tab bar when sheet is open
  useEffect(() => {
    tabNavigation.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : visibleTabBarStyle,
    });
  }, [isSheetOpen, tabNavigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      tabNavigation.setOptions({ tabBarStyle: visibleTabBarStyle });
    });
    return unsubscribe;
  }, [navigation, tabNavigation]);

  useEffect(() => {
    if (!isSheetOpen) return;

    const onBackPress = () => {
      bottomSheetRef.current?.close();
      setIsSheetOpen(false);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [isSheetOpen]);

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
            <Text style={styles.headerText}>{t("medsScreen.myMedications")}</Text>
            {medications.length > 0 && (
              <Text style={styles.subHeaderText}>
                {medications.length}{" "}
                {medications.length === 1 ? t("medsScreen.medication") : t("medsScreen.medications")}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke={theme.textSecondary}
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>{t("medsScreen.emptyText")}</Text>
            <Text style={styles.emptySubtext}>
              {t("medsScreen.emptySubtext")}
            </Text>
          </View>
        }
      />

      {!isSheetOpen && <AddMedicationButton />}

      <MedicationBottomSheet
        ref={bottomSheetRef}
        medication={selectedMed}
        scheduleLabel={selectedScheduleLabel}
        onEdit={handleEditFromSheet}
        onDelete={handleDeleteFromSheet}
        onToggleActive={handleToggleActive}
        onAnimate={handleSheetAnimate}
      />

      <BaseModal
        visible={deleteModal.visible}
        title={t("medicationSheet.delete")}
        message={t("medsScreen.deleteConfirm", { name: deleteModal.name })}
        onDismiss={() => setDeleteModal({ visible: false })}
        buttons={[
          {
            text: t("common.cancel"),
            onPress: () => setDeleteModal({ visible: false }),
            variant: "default",
          },
          {
            text: t("common.delete"),
            onPress: confirmDelete,
            variant: "destructive",
          },
        ]}
      />

      <UndoSnackbar
        visible={snackbar.visible}
        name={snackbar.name ?? ""}
        onUndo={handleUndoDelete}
        onDismiss={handleCommitDelete}
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
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
    color: theme.textPrimary,
  },
  subHeaderText: {
    fontSize: 14,
    color: theme.textSecondary,
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
    color: theme.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});

export default MedsScreen;
