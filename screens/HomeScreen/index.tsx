import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import BottomSheet from "@gorhom/bottom-sheet";

import { Medication, MedicationLog } from "../../types/medication";
import { WeekStart } from "../../types/schedule";

import { useMedicationStore } from "../../store/medicationStore";
import { useLogStore } from "../../store/logsStore";
import { useSettingsStore } from "../../store/settingsStore";

import { useTimeFormat } from "../../hooks/useTimeFormat";

import { snoozeMedicationNotification } from "../../services/notificationService";

import { getLocalDateString } from "../../utils/dateUtils";
import {
  buildDailySchedule,
  isMedicationScheduledForDate,
  WeekdayMap,
} from "../../utils/medicationScheduleUtils";

import MedicationActionSheet from "./components/MedicationActionSheet";
import ScreenLayout from "../../components/ScreenLayout";
import { Text } from "../../components/Text";
import AddMedicationButton from "../../components/AddMedicationButton";
import MedicationCard from "./components/MedicationCard";
import WeeklyCalendar from "./components/WeeklyCalendar";

import PillBottleIcon from "../../assets/icons/pill-bottle.svg";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const buildWeekdayMap = (weekStartsOn: WeekStart): WeekdayMap => {
  const map: WeekdayMap = {};
  for (let i = 0; i < 7; i++) {
    map[(weekStartsOn + i) % 7] = i + 1;
  }
  return map;
};

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { medications, updateStock } = useMedicationStore();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const weekdayMap = useMemo(
    () => buildWeekdayMap(weekStartsOn),
    [weekStartsOn],
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const { logs, addLog, updateLog, deleteLog } = useLogStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const actionSheetRef = useRef<BottomSheet>(null);
  const { formatTimeString } = useTimeFormat();

  const [selectedItem, setSelectedItem] = useState<{
    medication: Medication;
    time: string;
    log?: MedicationLog;
  } | null>(null);

  const handleSheetAnimate = useCallback(
    (_fromIndex: number, toIndex: number) => {
      setIsSheetOpen(toIndex >= 0);
    },
    [],
  );

  // Minutely missed state check
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);

    return () => clearInterval(interval);
  }, []);

  const schedule = useMemo(
    () =>
      buildDailySchedule(
        medications,
        logs,
        selectedDate,
        weekdayMap,
        formatTimeString,
        now,
      ),
    [medications, logs, selectedDate, weekdayMap, formatTimeString, now],
  );

  const hasMedsOnDate = useCallback(
    (date: Date) =>
      medications.some((med) =>
        isMedicationScheduledForDate(med, date, weekdayMap),
      ),
    [medications, weekdayMap],
  );

  const selectedLog = useMemo(() => {
    if (!selectedItem) return undefined;
    return logs.find(
      (l) =>
        l.medicationId === selectedItem.medication.id &&
        l.scheduledTime === selectedItem.time &&
        l.scheduledDate === getLocalDateString(selectedDate),
    );
  }, [selectedItem, logs, selectedDate]);

  const handleOpenSheet = useCallback(
    (medication: Medication, time: string, log?: MedicationLog) => {
      setSelectedItem({ medication, time, log });
      actionSheetRef.current?.expand();
    },
    [],
  );

  const handleToggle = useCallback(
    (medicationId: string, time: string, doseAmount?: number) => {
      const dateStr = getLocalDateString(selectedDate);
      const existingLog = logs.find(
        (l) =>
          l.medicationId === medicationId &&
          l.scheduledTime === time &&
          l.scheduledDate === dateStr,
      );

      if (existingLog) {
        if (existingLog.takenAt && !existingLog.skipped) {
          deleteLog(existingLog.id);
          if (doseAmount) updateStock(medicationId, doseAmount);
        } else {
          const wasTaken = !!existingLog.takenAt && !existingLog.skipped;
          updateLog(existingLog.id, {
            takenAt: new Date(),
            skipped: false,
            ...(doseAmount && { doseAmount }),
          });
          if (!wasTaken && doseAmount) updateStock(medicationId, -doseAmount);
        }
      } else {
        addLog({
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          takenAt: new Date(),
          skipped: false,
          doseAmount,
        });
        if (doseAmount) updateStock(medicationId, -doseAmount);
      }
    },
    [selectedDate, logs, deleteLog, updateLog, addLog, updateStock],
  );

  const handleSkip = useCallback(
    (medicationId: string, time: string) => {
      const dateStr = getLocalDateString(selectedDate);
      const existingLog = logs.find(
        (l) =>
          l.medicationId === medicationId &&
          l.scheduledTime === time &&
          l.scheduledDate === dateStr,
      );

      if (existingLog) {
        if (existingLog.skipped) {
          deleteLog(existingLog.id);
        } else {
          const wasTaken = !!existingLog.takenAt && !existingLog.skipped;
          updateLog(existingLog.id, { takenAt: undefined, skipped: true });
          if (wasTaken && existingLog.doseAmount) {
            updateStock(medicationId, existingLog.doseAmount);
          }
        }
      } else {
        addLog({
          medicationId,
          scheduledDate: dateStr,
          scheduledTime: time,
          skipped: true,
        });
      }
    },
    [selectedDate, logs, deleteLog, updateLog, addLog, updateStock],
  );

  const handleSnooze = useCallback(
    async (medicationId: string, time: string, minutes: number) => {
      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;
      const doseStr = medication.timeDoses?.find(
        (td) => td.time === time,
      )?.dose;
      await snoozeMedicationNotification(medication, time, minutes, doseStr);
    },
    [medications],
  );

  const navigation = useNavigation();

  // Hide tab bar when sheet is open
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSheetOpen
        ? { display: "none" }
        : {
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderTopWidth: 0,
            boxShadow: "none",
            elevation: 0,
          },
    });
  }, [isSheetOpen, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderTopWidth: 0,
          boxShadow: "none",
          elevation: 0,
        },
      });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!isSheetOpen) return;

    const onBackPress = () => {
      actionSheetRef.current?.close();
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
      <WeeklyCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasMedsOnDate={hasMedsOnDate}
      />

      <FlatList
        style={styles.medList}
        contentContainerStyle={styles.listContent}
        data={schedule}
        keyExtractor={(item) => item.logKey}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item.medication}
            time={item.scheduledTime}
            displayTime={item.displayTime}
            dose={item.dose}
            log={item.log}
            isMissed={item.status === "missed"}
            onToggle={(medId, time) => {
              const amount = parseFloat(item.dose) || 1;
              handleToggle(medId, time, amount);
            }}
            onOpenSheet={handleOpenSheet}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <PillBottleIcon
              height={64}
              width={64}
              stroke={theme.textPrimary}
              strokeWidth={1}
            />
            <Text style={styles.emptyText}>{t("home.emptyText")}</Text>
            <Text style={styles.emptySubtext}>
              {selectedDate.toLocaleDateString(i18n.language?.split("-")[0] ?? "en", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        }
      />

      {!isSheetOpen && <AddMedicationButton />}

      <MedicationActionSheet
        ref={actionSheetRef}
        medicationName={selectedItem?.medication.name ?? ""}
        displayTime={selectedItem ? formatTimeString(selectedItem.time) : ""}
        isTaken={!!selectedLog?.takenAt && !selectedLog?.skipped}
        isSkipped={!!selectedLog?.skipped}
        onTaken={() => {
          if (!selectedItem) return;
          const doseStr = selectedItem.medication.timeDoses?.find(
            (td) => td.time === selectedItem.time,
          )?.dose;
          const amount = parseFloat(doseStr || "1") || 1;
          handleToggle(selectedItem.medication.id, selectedItem.time, amount);
        }}
        onSkip={() =>
          selectedItem &&
          handleSkip(selectedItem.medication.id, selectedItem.time)
        }
        onSnooze={(minutes) =>
          selectedItem &&
          handleSnooze(selectedItem.medication.id, selectedItem.time, minutes)
        }
        onAnimate={handleSheetAnimate}
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  medList: {
    paddingHorizontal: 32,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.surface,
  },
  listContent: { paddingBottom: 72 },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    gap: 8,
  },
  emptyText: { fontSize: 18, fontWeight: "500" },
  emptySubtext: {
    fontSize: 14,
    color: theme.textPrimary,
    textTransform: "capitalize",
  },
});

export default HomeScreen;
