import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { NavProp } from "../../../types/navigation";
import { Colors } from "../../../constants/theme";
import { DEFAULT_UNITS, DOSE_UNITS_BY_FORM } from "../../../constants/units";
import { useMedicationStore } from "../../../store/medicationStore";
import { useTimeFormat } from "../../../hooks/useTimeFormat";

import AddMedicationHeader from "../components/AddMedicationHeader";
import NextButton from "../components/NextButton";
import PlusIcon from "../../../assets/icons/plus.svg";

import { UnitSelector } from "./components/UnitSelector";
import { TimeDoseCard } from "./components/TimeDoseCard";
import { DailySummaryCard } from "./components/DailySummaryCard";
import { TimePickerModal } from "./components/TimePickerModal";

type TimeDoseEntry = {
  id: string;
  time: Date;
  amount: string;
};

const formatTime24 = (date: Date) => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const parseTime24 = (time: string): Date => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};

const createTimeAt = (hour: number): Date => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
};

const isValidAmount = (amount: string) => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

const sanitizeDecimalInput = (text: string): string => {
  const numeric = text.replace(/[^0-9.]/g, "");
  const parts = numeric.split(".");
  return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : numeric;
};

const Step3Screen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NavProp>();
  const { draft, setDraft, clearDraft } = useMedicationStore();
  const { formatTime } = useTimeFormat();

  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;

  const is24Hour = useTimeFormat().timeFormat === "24h";
  const availableUnits = DOSE_UNITS_BY_FORM[draft.form || ""] || DEFAULT_UNITS;

  const [selectedUnit, setSelectedUnit] = useState<string>(() => {
    if (!draft.timeDoses?.length) return "";
    const parts = draft.timeDoses[0].dose?.split(" ") ?? [];
    const unitLabel = parts.slice(1).join(" ");
    return availableUnits.find((u) => u.label === unitLabel)?.value ?? "";
  });

  const [timeDoses, setTimeDoses] = useState<TimeDoseEntry[]>(() => {
    if (draft.timeDoses?.length) {
      return draft.timeDoses.map((td, i) => {
        const parts = td.dose?.split(" ") ?? [];
        return {
          id: String(i + 1),
          time: parseTime24(td.time),
          amount: parts[0] ?? "",
        };
      });
    }
    return [{ id: "1", time: createTimeAt(8), amount: "" }];
  });

  const [activeTimePickerId, setActiveTimePickerId] = useState<string | null>(
    null,
  );

  const activeTime =
    timeDoses.find((d) => d.id === activeTimePickerId)?.time ?? new Date();

  const updateDose = (id: string, updates: Partial<TimeDoseEntry>) => {
    setTimeDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  const addDose = () => {
    const lastHour = timeDoses[timeDoses.length - 1].time.getHours();
    setTimeDoses((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        time: createTimeAt((lastHour + 6) % 24),
        amount: "",
      },
    ]);
  };

  const removeDose = (id: string) => {
    setTimeDoses((prev) => prev.filter((d) => d.id !== id));
  };

  /* ------------------------------- Time Picker ------------------------------ */
  const handleTimeConfirm = (date: Date) => {
    if (activeTimePickerId) {
      updateDose(activeTimePickerId, { time: date });
    }
    setActiveTimePickerId(null);
  };

  const handleAmountChange = (id: string, text: string) => {
    updateDose(id, { amount: sanitizeDecimalInput(text) });
  };

  /* ------------------------------- Validation ------------------------------- */
  const isDoseComplete = (td: TimeDoseEntry) =>
    !!selectedUnit && isValidAmount(td.amount);

  const allDosesComplete = timeDoses.every(isDoseComplete);

  /* ------------------------------- Navigation ------------------------------- */
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
    if (mode !== "edit") clearDraft();
    navigation.getParent()?.goBack();
  };

  const unitLabel =
    availableUnits.find((u) => u.value === selectedUnit)?.label ?? "";

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.modal}>
        <AddMedicationHeader currentStep={3} title="Time & Dose" />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary — only visible when all doses are filled */}
          {allDosesComplete && (
            <DailySummaryCard
              doses={timeDoses}
              unitLabel={unitLabel}
              formatTime={formatTime}
            />
          )}

          <UnitSelector
            units={availableUnits}
            selected={selectedUnit}
            onSelect={setSelectedUnit}
          />

          <View style={styles.dosesSection}>
            <Text style={styles.sectionLabel}>When and how much?</Text>

            {timeDoses.map((td, index) => (
              <TimeDoseCard
                key={td.id}
                index={index}
                amount={td.amount}
                selectedUnit={selectedUnit}
                unitLabel={unitLabel}
                canRemove={timeDoses.length > 1}
                onRemove={() => removeDose(td.id)}
                onOpenTimePicker={() => setActiveTimePickerId(td.id)}
                onAmountChange={(text) => handleAmountChange(td.id, text)}
                formattedTime={formatTime(td.time)}
              />
            ))}

            <Pressable
              style={[
                styles.addButton,
                !selectedUnit && styles.addButtonDisabled,
              ]}
              onPress={addDose}
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

        <NextButton disabled={!allDosesComplete} onPress={handleNext} />
      </View>

      <TimePickerModal
        visible={activeTimePickerId !== null}
        value={activeTime}
        is24Hour={is24Hour}
        onConfirm={handleTimeConfirm}
        onDismiss={() => setActiveTimePickerId(null)}
      />
    </KeyboardAwareScrollView>
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
  content: { flex: 1, marginBottom: 12 },
  scrollContent: { paddingBottom: 20, gap: 16 },
  dosesSection: { gap: 12 },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
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
