import { useNavigation } from "@react-navigation/native";
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
import CloseIcon from "../../assets/icons/close.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import TrashIcon from "../../assets/icons/trash.svg";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "./components/NextButton";
import { useState, useCallback } from "react";
import { DEFAULT_UNITS, DOSE_UNITS_BY_FORM } from "../../constants/units";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type DoseEntry = {
  id: string;
  time: Date;
  amount: string;
  unit: string;
};

const Step3Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { draft, setDraft } = useMedicationStore();

  const medicationForm = draft.form || "";
  const availableUnits = DOSE_UNITS_BY_FORM[medicationForm] || DEFAULT_UNITS;

  const [doses, setDoses] = useState<DoseEntry[]>(() => [
    {
      id: "1",
      time: createDefaultTime(8),
      amount: "",
      unit: "",
    },
  ]);

  const [activeTimePickerId, setActiveTimePickerId] = useState<string | null>(
    null,
  );

  function createDefaultTime(hour: number): Date {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  const addNewDose = () => {
    const newId = (doses.length + 1).toString();
    const lastDose = doses[doses.length - 1];
    const newHour = (lastDose.time.getHours() + 6) % 24;

    setDoses([
      ...doses,
      {
        id: newId,
        time: createDefaultTime(newHour),
        amount: "",
        unit: "",
      },
    ]);
  };

  const removeDose = (id: string) => {
    if (doses.length === 1) return;
    setDoses(doses.filter((d) => d.id !== id));
  };

  const updateDose = (id: string, updates: Partial<DoseEntry>) => {
    setDoses(doses.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setActiveTimePickerId(null);
      }
      if (selectedDate && activeTimePickerId) {
        updateDose(activeTimePickerId, { time: selectedDate });
      }
    },
    [activeTimePickerId],
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAmountChange = (id: string, text: string) => {
    const numeric = text.replace(/[^0-9.]/g, "");
    const parts = numeric.split(".");
    const clean =
      parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : numeric;
    updateDose(id, { amount: clean });
  };

  const isDoseComplete = (dose: DoseEntry): boolean => {
    if (!dose.unit) return false;
    const unit = availableUnits.find((u) => u.value === dose.unit);
    if (unit?.needsAmount && !dose.amount) return false;
    return true;
  };

  const isFormComplete = doses.every(isDoseComplete);

  const handleNext = () => {
    const times = doses.map((d) => formatTime(d.time));
    const doseStrings = doses.map((d) => {
      const unitLabel =
        availableUnits.find((u) => u.value === d.unit)?.label || d.unit;
      return d.amount ? `${d.amount} ${unitLabel}` : unitLabel;
    });

    setDraft({
      times,
      dose: doseStrings.join(", "),
    });

    navigation.navigate("AddMedication", { screen: "Step4" });
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Time & Dose</Text>
          <Pressable
            onPress={() => navigation.getParent()?.goBack()}
            style={styles.headerIcon}
          >
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isFormComplete && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Daily Schedule</Text>
              {doses.map((dose, idx) => (
                <View key={dose.id} style={styles.summaryRow}>
                  <Text style={styles.summaryTime}>
                    {formatTime(dose.time)}
                  </Text>
                  <Text style={styles.summaryDose}>
                    {dose.amount}{" "}
                    {availableUnits.find((u) => u.value === dose.unit)?.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>When and how much?</Text>
            {doses.map((dose, index) => (
              <View key={dose.id} style={styles.doseCard}>
                <View style={styles.doseHeader}>
                  <View style={styles.doseNumberBadge}>
                    <Text style={styles.doseNumberText}>#{index + 1}</Text>
                  </View>
                  {doses.length > 1 && (
                    <Pressable
                      onPress={() => removeDose(dose.id)}
                      style={styles.removeButton}
                    >
                      <TrashIcon width={18} height={18} stroke={Colors.error} />
                    </Pressable>
                  )}
                </View>

                {/* ------------------------------- Time Picker ------------------------------ */}
                <Pressable
                  style={styles.timePickerButton}
                  onPress={() => setActiveTimePickerId(dose.id)}
                >
                  <Text style={styles.timeText}>{formatTime(dose.time)}</Text>
                  <Text style={styles.timeHint}>Tap to change time</Text>
                </Pressable>

                {activeTimePickerId === dose.id && (
                  <DateTimePicker
                    value={dose.time}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleTimeChange}
                  />
                )}

                {/* ------------------------------ Unit Section ------------------------------ */}
                <View style={styles.unitsContainer}>
                  {availableUnits.map((unit) => (
                    <Pressable
                      key={unit.value}
                      style={[
                        styles.unitChip,
                        dose.unit === unit.value && styles.unitChipActive,
                      ]}
                      onPress={() => {
                        updateDose(dose.id, {
                          unit: unit.value,
                          amount: unit.needsAmount ? dose.amount : "",
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          dose.unit === unit.value && styles.unitTextActive,
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* ------------------------------ Amount Input ------------------------------ */}
                {dose.unit &&
                  availableUnits.find((u) => u.value === dose.unit)
                    ?.needsAmount && (
                    <View style={styles.amountContainer}>
                      <TextInput
                        style={styles.amountInput}
                        value={dose.amount}
                        onChangeText={(text) =>
                          handleAmountChange(dose.id, text)
                        }
                        placeholder="Enter amount"
                        placeholderTextColor={Colors.textSecondary}
                        keyboardType="decimal-pad"
                        maxLength={6}
                      />
                      <Text style={styles.amountUnit}>
                        {
                          availableUnits.find((u) => u.value === dose.unit)
                            ?.label
                        }
                      </Text>
                    </View>
                  )}

                {/* --------------------------------- Summary -------------------------------- */}
                {isDoseComplete(dose) && (
                  <View style={styles.miniSummary}>
                    <Text style={styles.miniSummaryText}>
                      Take {dose.amount}{" "}
                      {availableUnits.find((u) => u.value === dose.unit)?.label}{" "}
                      at {formatTime(dose.time)}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* ----------------------------- New Dose Button ---------------------------- */}
            <Pressable style={styles.addButton} onPress={addNewDose}>
              <PlusIcon width={20} height={20} stroke={Colors.primary} />
              <Text style={styles.addButtonText}>Add another time</Text>
            </Pressable>
          </View>
        </ScrollView>
        {/* ------------------------------- Next Button ------------------------------ */}
        <NextButton disabled={!isFormComplete} onPress={handleNext} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
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
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 20,
  },
  infoCard: {
    backgroundColor: Colors.primary + "15",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  infoSubvalue: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  doseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "20",
  },
  doseHeader: {
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
  doseNumberText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  removeButton: {
    padding: 4,
  },
  timePickerButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  timeText: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  timeHint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  unitsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
  unitTextActive: {
    color: "#fff",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  amountInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  amountUnit: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  miniSummary: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  miniSummaryText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
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
  addButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
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
  summaryTime: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  summaryDose: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Step3Screen;
