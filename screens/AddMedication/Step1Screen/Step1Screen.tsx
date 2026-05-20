import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { NavProp } from "../../../types/navigation";
import { Medication } from "../../../types/medication";
import { Colors } from "../../../constants/theme";
import { useMedicationStore } from "../../../store/medicationStore";

import AddMedicationHeader from "../components/AddMedicationHeader";
import NextButton from "../components/NextButton";
import { MedicationFormPicker } from "./components/MedicationFormPicker";
import { MedicationNameInput } from "./components/MedicationNameInput";
import { PixelRatio } from "react-native";

type FormErrors = {
  medName?: string;
  selectedForm?: string;
};

const Step1Screen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { draft, setDraft, clearDraft } = useMedicationStore();

  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!isEditMode) clearDraft();
  }, []);

  const [selectedForm, setSelectedForm] = useState<Medication["form"]>(
    isEditMode ? (draft.form ?? "capsule") : "capsule",
  );
  const [medName, setMedName] = useState<string>(
    isEditMode ? (draft.name ?? "") : "",
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const isFormValid = () =>
    medName.trim().length > 0 && selectedForm !== undefined;

  const validateAndProceed = () => {
    const newErrors: FormErrors = {};
    if (!medName.trim()) newErrors.medName = "Medication name is required";
    if (!selectedForm) newErrors.selectedForm = "Medication form is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setDraft({ name: medName.trim(), form: selectedForm });
    navigation.navigate("AddMedication", {
      screen: "Step2",
      params: { mode, medicationId },
    });
  };

  const handleClose = () => {
    if (mode !== "edit") clearDraft();
    navigation.getParent()?.goBack();
  };


// Bu değer muhtemelen 0.85 çıkacak
console.log("System font scale:", PixelRatio.getFontScale());

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.modal}>
        <AddMedicationHeader
          currentStep={1}
          title="Add Medication"
          showBackIcon={false}
        />

        <View style={styles.content}>
          <View style={styles.formArea}>
            <MedicationFormPicker
              value={selectedForm}
              onChange={setSelectedForm}
            />
            <MedicationNameInput
              value={medName}
              onChange={setMedName}
              error={errors.medName}
            />
          </View>

          <NextButton disabled={!isFormValid()} onPress={validateAndProceed} />
        </View>
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
  content: {
    flex: 1,
  },
  formArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
});

export default Step1Screen;
