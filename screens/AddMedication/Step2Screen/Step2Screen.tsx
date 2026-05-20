import { useCallback, useRef, useState } from "react";
import { Animated, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "../../../components/Text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { NavProp } from "../../../types/navigation";
import { Schedule, ScheduleType } from "../../../types/schedule";
import { Colors } from "../../../constants/theme";
import { TIER1_SCHEDULES, TIER2_SCHEDULES } from "../../../constants/schedules";
import { useMedicationStore } from "../../../store/medicationStore";

import AddMedicationHeader from "../components/AddMedicationHeader";
import NextButton from "../components/NextButton";
import DateInputInfoCard from "../components/DateInputInfoCard";
import RightArrowIcon from "../../../assets/icons/arrow-right.svg";

import { ScheduleButton } from "./components/ScheduleButton";
import {
  WeekdayPicker,
  IntervalPicker,
  MonthDayPicker,
  PrnInfo,
} from "./components/ScheduleExpanders";
import { useSettingsStore } from "../../../store/settingsStore";

const Step2Screen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { width: screenWidth } = useWindowDimensions();
  const { draft, setDraft, clearDraft } = useMedicationStore();
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;

  /* ------------------------------ Slider State ------------------------------ */
  const [isOnOtherView, setIsOnOtherView] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const MODAL_PADDING = 24;
  const contentWidth = screenWidth - MODAL_PADDING * 2;

  /* ----------------------------- Schedule State ----------------------------- */
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(
    (draft.schedule?.type as ScheduleType) || null,
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    draft.schedule?.days || [],
  );
  const [intervalDays, setIntervalDays] = useState<string>(
    draft.schedule?.interval?.toString() || "",
  );
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>(
    draft.schedule?.days || [],
  );
  const [biweeklyStartDay, setBiweeklyStartDay] = useState<Date | null>(
    draft.schedule?.type === "biweekly" && draft.schedule.startDate
      ? new Date(draft.schedule.startDate)
      : null,
  );
  const [monthlyStartDay, setMonthlyStartDay] = useState<Date | null>(
    draft.schedule?.type === "monthly" && draft.schedule.startDate
      ? new Date(draft.schedule.startDate)
      : null,
  );
  const [activeDatePickerConfig, setActiveDatePickerConfig] = useState<
    "biweekly" | "monthly" | null
  >(null);

  /* ----------------------------- Slider Helpers ----------------------------- */
  const slideToOther = () => {
    setIsOnOtherView(true);
    Animated.timing(slideAnim, {
      toValue: -contentWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goBack = () => {
    if (isOnOtherView) {
      setIsOnOtherView(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      navigation.goBack();
    }
  };

  const handleClose = () => {
    if (mode !== "edit") clearDraft();
    navigation.getParent()?.goBack();
  };

  /* --------------------------- Schedule Selection --------------------------- */
  const handleSelectSchedule = (id: ScheduleType) => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.7 },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });

    if (selectedSchedule === id) {
      setSelectedSchedule(null);
      setDraft({ schedule: undefined });
      setSelectedWeekdays([]);
      setIntervalDays("");
      setSelectedMonthDays([]);
      setMonthlyStartDay(null);
      setBiweeklyStartDay(null);
      return;
    }

    setSelectedSchedule(id);

    const base: Schedule = { type: id, startDate: new Date().toISOString() };

    const schedule: Schedule = (() => {
      switch (id) {
        case "weekly":
          return selectedWeekdays.length > 0
            ? { ...base, days: selectedWeekdays }
            : base;
        case "interval":
          return intervalDays
            ? { ...base, interval: parseInt(intervalDays, 10) }
            : base;
        case "specificmonth":
          return selectedMonthDays.length > 0
            ? { ...base, days: selectedMonthDays }
            : base;
        case "monthly":
          return monthlyStartDay
            ? { ...base, startDate: monthlyStartDay.toISOString() }
            : base;
        case "biweekly":
          return biweeklyStartDay
            ? { ...base, startDate: biweeklyStartDay.toISOString() }
            : base;
        default:
          return base;
      }
    })();

    setDraft({ schedule });
  };

  /* ------------------------------ Date Pickers ------------------------------ */
  const applyDateSelection = (type: "biweekly" | "monthly", date: Date) => {
    if (type === "biweekly") {
      setBiweeklyStartDay(date);
      setDraft({
        schedule: { type: "biweekly", startDate: date.toISOString() },
      });
    } else {
      setMonthlyStartDay(date);
      setDraft({
        schedule: { type: "monthly", startDate: date.toISOString() },
      });
    }
  };

  // iOS only — called by the inline DateTimePicker component
  const handleIOSDateChange = (event: any, selectedDate?: Date) => {
    if (event.type !== "set" || !selectedDate || !activeDatePickerConfig)
      return;
    applyDateSelection(activeDatePickerConfig, selectedDate);
  };

  const openDatePicker = (type: "biweekly" | "monthly") => {
    const currentDate =
      type === "biweekly"
        ? biweeklyStartDay || new Date()
        : monthlyStartDay || new Date();

    if (Platform.OS === "android") {
      // Pass a self-contained callback — no stale closure risk
      DateTimePickerAndroid.open({
        value: currentDate,
        mode: "date",
        minimumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === "set" && date) applyDateSelection(type, date);
        },
      });
    } else {
      setActiveDatePickerConfig(type);
    }
  };

  const openMonthlyPicker = useCallback(
    () => openDatePicker("monthly"),
    [monthlyStartDay],
  );
  const openBiweeklyPicker = useCallback(
    () => openDatePicker("biweekly"),
    [biweeklyStartDay],
  );

  const formatDate = (date: Date | null) =>
    date
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Select a date";

  /* ----------------- Weekday & Interval & Month Day Handlers ---------------- */
  const toggleWeekday = (day: number) => {
    const updated = selectedWeekdays.includes(day)
      ? selectedWeekdays.filter((d) => d !== day)
      : [...selectedWeekdays, day];
    setSelectedWeekdays(updated);
    setDraft({
      schedule: {
        type: "weekly",
        days: updated,
        startDate: new Date().toISOString(),
      },
    });
  };

  const handleIntervalChange = (val: string) => {
    setIntervalDays(val);
    if (val) {
      setDraft({
        schedule: {
          type: "interval",
          interval: parseInt(val, 10),
          startDate: new Date().toISOString(),
        },
      });
    }
  };

  const toggleMonthDay = (day: number) => {
    const updated = selectedMonthDays.includes(day)
      ? selectedMonthDays.filter((d) => d !== day)
      : [...selectedMonthDays, day];
    setSelectedMonthDays(updated);
    setDraft({
      schedule: {
        type: "specificmonth",
        days: updated,
        startDate: new Date().toISOString(),
      },
    });
  };

  /* ---------------------- Expanded Content Per Schedule --------------------- */
  const getExpandedContent = (id: ScheduleType) => {
    switch (id) {
      case "weekly":
        return (
          <WeekdayPicker
            selected={selectedWeekdays}
            onToggle={toggleWeekday}
            weekStartsOn={weekStartsOn}
          />
        );
      case "interval":
        return (
          <IntervalPicker
            value={intervalDays}
            onChange={handleIntervalChange}
          />
        );
      case "monthly":
        return (
          <DateInputInfoCard
            cardText={formatDate(monthlyStartDay)}
            cardLabel="Which day of the month should this repeat?"
            onPress={openMonthlyPicker}
            isEmpty={!monthlyStartDay}
          />
        );
      case "biweekly":
        return (
          <DateInputInfoCard
            cardText={formatDate(biweeklyStartDay)}
            cardLabel="Which day of the month should this start?"
            onPress={openBiweeklyPicker}
            isEmpty={!biweeklyStartDay}
          />
        );
      case "specificmonth":
        return (
          <MonthDayPicker
            selected={selectedMonthDays}
            onToggle={toggleMonthDay}
          />
        );
      case "prn":
        return <PrnInfo />;
      default:
        return null;
    }
  };

  /* ------------------------------- Validation ------------------------------- */
  const isScheduleComplete = (): boolean => {
    if (!selectedSchedule) return false;
    if (selectedSchedule === "weekly") return selectedWeekdays.length > 0;
    if (selectedSchedule === "interval") return parseInt(intervalDays) > 0;
    if (selectedSchedule === "specificmonth")
      return selectedMonthDays.length > 0;
    if (selectedSchedule === "monthly") return monthlyStartDay !== null;
    if (selectedSchedule === "biweekly") return biweeklyStartDay !== null;
    return true;
  };

  const handleNext = () => {
    navigation.navigate("AddMedication", {
      screen: "Step3",
      params: { mode, medicationId },
    });
  };

  /* --------------------------------- Render --------------------------------- */
  const renderScheduleList = (schedules: typeof TIER1_SCHEDULES) =>
    schedules.map(({ id, label }) => (
      <ScheduleButton
        key={id}
        id={id}
        label={label}
        isSelected={selectedSchedule === id}
        onPress={handleSelectSchedule}
      >
        {getExpandedContent(id)}
      </ScheduleButton>
    ));

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backdrop}
        onPress={isOnOtherView ? goBack : handleClose}
      />

      <View style={styles.modal}>
        <AddMedicationHeader currentStep={2} title="Schedule" onBack={goBack} />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.slider,
              {
                width: contentWidth * 2,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* -------------------------------- Main View ------------------------------- */}
            <ScrollView
              style={{ width: contentWidth }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.sectionLabel}>
                How often?
              </Text>
              <View style={styles.optionList}>
                {renderScheduleList(TIER1_SCHEDULES)}

                <Pressable style={styles.otherButton} onPress={slideToOther}>
                  <Text style={styles.otherText}>
                    Something else
                  </Text>
                  <RightArrowIcon
                    height={18}
                    width={18}
                    stroke={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </ScrollView>

            {/* ------------------------------ Advanced View ----------------------------- */}
            <ScrollView
              style={{ width: contentWidth }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.sectionLabel}>
                Advanced Options
              </Text>
              <View style={styles.optionList}>
                {renderScheduleList(TIER2_SCHEDULES)}
              </View>
            </ScrollView>
          </Animated.View>

          <NextButton disabled={!isScheduleComplete()} onPress={handleNext} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    width: "100%",
    height: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    overflow: "hidden",
  },
  content: { flex: 1, overflow: "hidden" },
  slider: { flex: 1, flexDirection: "row", overflow: "hidden" },
  scrollContent: { paddingBottom: 20 },
  sectionLabel: {
    color: Colors.textPrimary,
    fontWeight: "600",
    marginVertical: 16,
    fontSize: 18,
  },
  optionList: { gap: 10 },
  otherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 8,
  },
  otherText: { color: Colors.textSecondary, fontSize: 16 },
});

export default Step2Screen;
