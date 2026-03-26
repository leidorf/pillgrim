import { useNavigation } from "@react-navigation/native";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ScrollView,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import CloseIcon from "../../assets/icons/close.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import RightArrowIcon from "../../assets/icons/arrow-right.svg";
import { useCallback, useRef, useState } from "react";
import { useMedicationStore } from "../../store/medicationStore";
import {
  TIER1_SCHEDULES,
  TIER2_SCHEDULES,
  WEEKDAYS,
} from "../../constants/schedules";
import { Schedule, ScheduleType } from "../../types/medication";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import NextButton from "../../components/NextButton";
import DateInputInfoCard from "../../components/DateInputInfoCard";
import InlineContainer from "../../components/InlineContainer";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const Step2Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();
  const { draft, setDraft } = useMedicationStore();

  const [isOnOtherView, setIsOnOtherView] = useState(false);
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

  const [biweeklyStartDay, setBiweeklyStartDay] = useState<Date | null>(null);
  const [monthlyStartDay, setMonthlyStartDay] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDatePickerConfig, setActiveDatePickerConfig] = useState<
    "biweekly" | "monthly" | null
  >(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const modalPadding = 24;
  const contentWidth = screenWidth - modalPadding * 2;

  const triggerLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.7 },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
  };

  const goToOther = () => {
    setIsOnOtherView(true);
    Animated.timing(slideAnim, {
      toValue: -contentWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const goBack = () => {
    setIsOnOtherView(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectSchedule = (id: ScheduleType) => {
    triggerLayoutAnimation();

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

    let schedule: Schedule = {
      type: id,
      startDate: new Date().toISOString(),
    };

    switch (id) {
      case "weekly":
        if (selectedWeekdays.length > 0) {
          schedule.days = selectedWeekdays;
        }
        break;
      case "interval":
        if (intervalDays) {
          schedule.interval = parseInt(intervalDays, 10);
        }
        break;
      case "specificmonth":
        if (selectedMonthDays.length > 0) {
          schedule.days = selectedMonthDays;
        }
        break;
      case "monthly":
        if (monthlyStartDay) {
          schedule.startDate = monthlyStartDay.toISOString();
        }
        break;
      case "biweekly":
        if (biweeklyStartDay) {
          schedule.startDate = biweeklyStartDay.toISOString();
        }
        break;
    }

    setDraft({ schedule });
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
    pickerType?: "biweekly" | "monthly",
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    const activeType = pickerType || activeDatePickerConfig;

    if (event.type === "set" && selectedDate && activeType) {
      if (activeType === "biweekly") {
        setBiweeklyStartDay(selectedDate);
        setDraft({
          schedule: {
            type: "biweekly",
            startDate: selectedDate.toISOString(),
          },
        });
      } else if (activeType === "monthly") {
        setMonthlyStartDay(selectedDate);
        setDraft({
          schedule: {
            type: "monthly",
            startDate: selectedDate.toISOString(),
          },
        });
      }
    } else if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const openDatePicker = (type: "biweekly" | "monthly") => {
    const currentDate =
      type === "biweekly"
        ? biweeklyStartDay || new Date()
        : monthlyStartDay || new Date();

    if (Platform.OS === "android") {
      setActiveDatePickerConfig(type);
      DateTimePickerAndroid.open({
        value: currentDate,
        onChange: (event, date) => handleDateChange(event, date, type),
        mode: "date",
        minimumDate: new Date(),
      });
    } else {
      setActiveDatePickerConfig(type);
      setShowDatePicker(true);
    }
  };
  const formatDate = (date: Date | null) => {
    if (!date) return "Select a date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
    const numeric = val.replace(/[^0-9]/g, "");
    setIntervalDays(numeric);
    if (numeric) {
      setDraft({
        schedule: {
          type: "interval",
          interval: parseInt(numeric, 10),
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

  const handleNextButton = () => {
    navigation.navigate("AddMedication", { screen: "Step3" });
  };

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

  /* --------------------------- Inline Expandables --------------------------- */
  const WeekdayPicker = () => (
    <InlineContainer containerText="Select days">
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(({ id, label }) => {
          const active = selectedWeekdays.includes(id);
          return (
            <Pressable
              key={id}
              style={[styles.weekdayChip, active && styles.chipActive]}
              onPress={() => toggleWeekday(id)}
            >
              <Text
                style={[styles.weekdayText, active && styles.chipTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </InlineContainer>
  );

  const IntervalPicker = () => (
    <InlineContainer containerText="Every how many days?">
      <View style={styles.intervalRow}>
        <Pressable
          style={styles.intervalStepper}
          onPress={() => {
            const val = Math.max(1, parseInt(intervalDays || "1") - 1);
            handleIntervalChange(val.toString());
          }}
        >
          <Text style={styles.stepperText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.intervalInput}
          value={intervalDays}
          onChangeText={handleIntervalChange}
          keyboardType="number-pad"
          placeholder="X"
          placeholderTextColor={Colors.textSecondary}
          maxLength={3}
        />
        <Pressable
          style={styles.intervalStepper}
          onPress={() => {
            const val = parseInt(intervalDays || "0") + 1;
            handleIntervalChange(val.toString());
          }}
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
        <Text style={styles.intervalUnit}>days</Text>
      </View>{" "}
    </InlineContainer>
  );

  const MonthDayPicker = () => (
    <InlineContainer containerText="Select days of the month (1–31)">
      <View style={styles.monthGrid}>
        {MONTH_DAYS.map((day) => {
          const active = selectedMonthDays.includes(day);
          return (
            <Pressable
              key={day}
              style={[styles.monthDayChip, active && styles.chipActive]}
              onPress={() => toggleMonthDay(day)}
            >
              <Text
                style={[styles.monthDayText, active && styles.chipTextActive]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </InlineContainer>
  );

  const BiweeklyPicker = () => {
    const handlePress = useCallback(() => openDatePicker("biweekly"), []);

    return (
      <DateInputInfoCard
        cardText={formatDate(biweeklyStartDay)}
        cardLabel="Which day of the month should this start?"
        onPress={handlePress}
        isEmpty={!biweeklyStartDay}
      />
    );
  };

  const MonthlyPicker = () => {
    const handlePress = useCallback(() => openDatePicker("monthly"), []);

    return (
      <DateInputInfoCard
        cardText={formatDate(monthlyStartDay)}
        cardLabel="Which day of the month should this repeat?"
        onPress={handlePress}
        isEmpty={!monthlyStartDay}
      />
    );
  };

  const PrnInfo = () => (
    <InlineContainer containerText="You can mark this medication manually whenever you need it." />
  );

  const getExpandedContent = (id: ScheduleType) => {
    if (selectedSchedule !== id) return null;
    switch (id) {
      case "weekly":
        return <WeekdayPicker />;
      case "interval":
        return <IntervalPicker />;
      case "monthly":
        return <MonthlyPicker />;
      case "biweekly":
        return <BiweeklyPicker />;
      case "specificmonth":
        return <MonthDayPicker />;
      case "prn":
        return <PrnInfo />;
      default:
        return null;
    }
  };

  /* --------------------------------- Render --------------------------------- */
  const renderScheduleButton = (id: ScheduleType, label: string) => {
    const isSelected = selectedSchedule === id;
    const expanded = getExpandedContent(id);

    return (
      <View key={id}>
        <Pressable
          style={[styles.scheduleButton, isSelected && styles.selectedBtn]}
          onPress={() => handleSelectSchedule(id)}
        >
          <Text
            style={[styles.scheduleText, isSelected && styles.selectedText]}
          >
            {label}
          </Text>
        </Pressable>
        {isSelected && expanded}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable
            onPress={isOnOtherView ? goBack : () => navigation.goBack()}
            style={styles.headerIcon}
          >
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Pressable
            onPress={() => navigation.getParent()?.goBack()}
            style={styles.headerIcon}
          >
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.sliderWrapper,
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
              <Text style={styles.sectionLabel}>How often?</Text>
              <View style={styles.optionList}>
                {TIER1_SCHEDULES.map(({ id, label }) =>
                  renderScheduleButton(id, label),
                )}

                <Pressable style={styles.otherButton} onPress={goToOther}>
                  <Text style={styles.otherText}>Something else</Text>
                  <RightArrowIcon
                    height={18}
                    width={18}
                    stroke={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            </ScrollView>

            {/* ------------------------------- Others View ------------------------------ */}
            <ScrollView
              style={{ width: contentWidth }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.sectionLabel}>Advanced Options</Text>
              <View style={styles.optionList}>
                {TIER2_SCHEDULES.map(({ id, label }) =>
                  renderScheduleButton(id, label),
                )}
              </View>
            </ScrollView>
          </Animated.View>

          {/* ------------------------------- Next Button ------------------------------ */}
          <NextButton
            disabled={!isScheduleComplete()}
            onPress={handleNextButton}
          />
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
  modalContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIcon: { padding: 4 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "600" },
  content: { flex: 1, overflow: "hidden" },
  sliderWrapper: { flex: 1, flexDirection: "row", overflow: "hidden" },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 16,
  },
  optionList: { gap: 10 },
  scheduleButton: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedBtn: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  selectedText: { color: Colors.primary, fontWeight: "600" },
  otherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 8,
  },
  otherText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "500" },
  weekdayRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  weekdayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  chipTextActive: { color: "#fff" },

  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  intervalStepper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  intervalInput: {
    minWidth: 52,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  intervalUnit: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  /* Month day grid */
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  monthDayChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  monthDayText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  dateInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default Step2Screen;
