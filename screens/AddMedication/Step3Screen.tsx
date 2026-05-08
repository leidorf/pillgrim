import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import PlusIcon from "../../assets/icons/plus.svg";
import TrashIcon from "../../assets/icons/trash.svg";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "./components/NextButton";
import { useState, useCallback } from "react";
import { DEFAULT_UNITS, DOSE_UNITS_BY_FORM } from "../../constants/units";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTimeFormat } from "../../hooks/useTimeFormat";
import AddMedicationHeader from "./components/AddMedicationHeader";

type TimeDoseEntry = {
  id: string;
  time: Date;
  amount: string;
};

function formatTime24(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function parseTime24(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

const Step3Screen = () => {
  const route = useRoute<any>();
  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;

  const { draft, setDraft, clearDraft } = useMedicationStore();
  const navigation = useNavigation<NavProp>();

  const { formatTime } = useTimeFormat();

  const medicationForm = draft.form || "";
  const availableUnits = DOSE_UNITS_BY_FORM[medicationForm] || DEFAULT_UNITS;

  const [selectedUnit, setSelectedUnit] = useState<string>(() => {
    if (!draft.timeDoses?.length) return "";
    const doseStr = draft.timeDoses[0].dose;
    const parts = doseStr?.split(" ") ?? [];
    const unitLabel = parts.slice(1).join(" ");
    return availableUnits.find((u) => u.label === unitLabel)?.value ?? "";
  });

  const [timeDoses, setTimeDoses] = useState<TimeDoseEntry[]>(() => {
    if (draft.timeDoses?.length) {
      return draft.timeDoses.map((td, i) => {
        const parts = td.dose?.split(" ") ?? [];
        const amount = parts[0] ?? "";
        return {
          id: String(i + 1),
          time: parseTime24(td.time),
          amount,
        };
      });
    }
    return [{ id: "1", time: createDefaultTime(8), amount: "" }];
  });

  const [activeTimePickerId, setActiveTimePickerId] = useState<string | null>(
    null,
  );

  function createDefaultTime(hour: number): Date {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  const handleUnitChange = (unitValue: string) => {
    setSelectedUnit(unitValue);
  };

  const addNewTimeDose = () => {
    const newId = (timeDoses.length + 1).toString();
    const lastDose = timeDoses[timeDoses.length - 1];
    const newHour = (lastDose.time.getHours() + 6) % 24;

    setTimeDoses([
      ...timeDoses,
      {
        id: newId,
        time: createDefaultTime(newHour),
        amount: "",
      },
    ]);
  };

  const removeTimeDose = (id: string) => {
    if (timeDoses.length === 1) return;
    setTimeDoses(timeDoses.filter((d) => d.id !== id));
  };

  const updateTimeDose = (id: string, updates: Partial<TimeDoseEntry>) => {
    setTimeDoses(
      timeDoses.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setActiveTimePickerId(null);
      }
      if (selectedDate && activeTimePickerId) {
        updateTimeDose(activeTimePickerId, { time: selectedDate });
      }
    },
    [activeTimePickerId],
  );

  const handleAmountChange = (id: string, text: string) => {
    let numeric = text.replace(/[^0-9.]/g, "");
    const parts = numeric.split(".");
    if (parts.length > 2) {
      numeric = parts[0] + "." + parts.slice(1).join("");
    }
    updateTimeDose(id, { amount: numeric });
  };

  const isValidAmount = (amount: string): boolean => {
    if (!amount) return false;
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const isTimeDoseComplete = (td: TimeDoseEntry): boolean => {
    if (!selectedUnit) return false;
    return isValidAmount(td.amount);
  };

  const isFormComplete = timeDoses.every(isTimeDoseComplete);

  const handleNext = () => {
    const unitLabel =
      availableUnits.find((u) => u.value === selectedUnit)?.label ||
      selectedUnit;

    setDraft({
      timeDoses: timeDoses.map((td) => ({
        time: formatTime24(td.time),
        dose: `${td.amount} ${unitLabel}`,
      })),
    });

    navigation.navigate("AddMedication", {
      screen: "Step4",
      params: { mode, medicationId },
    });
  };

  const handleClose = () => {
    if (mode !== "edit") {
      clearDraft();
    }
    navigation.getParent()?.goBack();
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={() => handleClose()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <AddMedicationHeader
          currentStep={3}
          title="Time & Dose"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* --------------------------------- Summary -------------------------------- */}
          {isFormComplete && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Daily Schedule</Text>
              {timeDoses.map((td) => (
                <View key={td.id} style={styles.summaryRow}>
                  <Text style={styles.summaryTime}>{formatTime(td.time)}</Text>
                  <Text style={styles.summaryDose}>
                    {td.amount}{" "}
                    {
                      availableUnits.find((u) => u.value === selectedUnit)
                        ?.label
                    }
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ----------------------------- Unit Selection ----------------------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Unit</Text>
            <View style={styles.unitsContainer}>
              {availableUnits.map((unit) => (
                <Pressable
                  key={unit.value}
                  style={[
                    styles.unitChip,
                    selectedUnit === unit.value && styles.unitChipActive,
                  ]}
                  onPress={() => handleUnitChange(unit.value)}
                >
                  <Text
                    style={[
                      styles.unitText,
                      selectedUnit === unit.value && styles.unitTextActive,
                    ]}
                  >
                    {unit.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* --------------------------- Time Dose Selection -------------------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>When and how much?</Text>

            {timeDoses.map((td, index) => {
              const hasInvalidAmount = td.amount && !isValidAmount(td.amount);

              return (
                <View key={td.id} style={styles.timeDoseCard}>
                  <View style={styles.timeDoseHeader}>
                    <View style={styles.doseNumberBadge}>
                      <Text style={styles.doseNumberText}>#{index + 1}</Text>
                    </View>
                    {timeDoses.length > 1 && (
                      <Pressable
                        onPress={() => removeTimeDose(td.id)}
                        style={styles.removeButton}
                      >
                        <TrashIcon
                          width={18}
                          height={18}
                          stroke={Colors.error || "#EF4444"}
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* ------------------------------- Time Picker ------------------------------ */}
                  <Pressable
                    style={styles.timePickerButton}
                    onPress={() => setActiveTimePickerId(td.id)}
                  >
                    <Text style={styles.timeText}>{formatTime(td.time)}</Text>
                    <Text style={styles.timeHint}>Tap to change time</Text>
                  </Pressable>

                  {activeTimePickerId === td.id && (
                    <DateTimePicker
                      value={td.time}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                    />
                  )}

                  {/* ------------------------------ Amount Input ------------------------------ */}
                  {selectedUnit ? (
                    <View
                      style={[
                        styles.amountContainer,
                        hasInvalidAmount && styles.amountContainerError,
                      ]}
                    >
                      <TextInput
                        style={styles.amountInput}
                        value={td.amount}
                        onChangeText={(text) => handleAmountChange(td.id, text)}
                        placeholder="Enter amount"
                        placeholderTextColor={Colors.textSecondary}
                        keyboardType="decimal-pad"
                        maxLength={6}
                      />
                      <Text style={styles.amountUnit}>
                        {
                          availableUnits.find((u) => u.value === selectedUnit)
                            ?.label
                        }
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectUnitHint}>
                      Please select a unit first
                    </Text>
                  )}

                  {hasInvalidAmount && (
                    <Text style={styles.errorText}>
                      Please enter a positive number greater than 0
                    </Text>
                  )}
                </View>
              );
            })}

            <Pressable
              style={[
                styles.addButton,
                !selectedUnit && styles.addButtonDisabled,
              ]}
              onPress={addNewTimeDose}
              disabled={!selectedUnit}
            >
              <PlusIcon
                width={20}
                height={20}
                stroke={selectedUnit ? Colors.primary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.addButtonText,
                  !selectedUnit && styles.addButtonTextDisabled,
                ]}
              >
                Add another time
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <NextButton disabled={!isFormComplete} onPress={handleNext} />
      </View>
    </KeyboardAwareScrollView>
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
    marginBottom: 20,
  },
  headerIcon: { padding: 4 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "600" },
  content: { flex: 1, marginBottom: 12 },
  scrollContent: { paddingBottom: 20, gap: 16 },
  section: { gap: 12 },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  unitsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
    minWidth: 64,
    alignItems: "center",
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitText: { color: Colors.textPrimary, fontSize: 14, fontWeight: "500" },
  unitTextActive: { color: "#fff", fontWeight: "600" },
  summaryCard: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "20",
  },
  summaryTime: { color: Colors.textPrimary, fontSize: 16, fontWeight: "600" },
  summaryDose: { color: Colors.primary, fontSize: 14, fontWeight: "500" },
  timeDoseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "20",
  },
  timeDoseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doseNumberBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doseNumberText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },
  removeButton: { padding: 4 },
  timePickerButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  timeText: { color: Colors.textPrimary, fontSize: 28, fontWeight: "700" },
  timeHint: { color: Colors.textSecondary, fontSize: 12 },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  amountContainerError: {
    borderColor: Colors.error || "#EF4444",
    borderWidth: 2,
  },
  amountInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  amountUnit: { color: Colors.textSecondary, fontSize: 14, fontWeight: "500" },
  selectUnitHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  errorText: {
    color: Colors.error || "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    borderStyle: "dashed",
    marginTop: 8,
  },
  addButtonDisabled: { borderColor: Colors.textSecondary + "30" },
  addButtonText: { color: Colors.primary, fontSize: 15, fontWeight: "600" },
  addButtonTextDisabled: { color: Colors.textSecondary },
});

export default Step3Screen;
