import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import PillIcon from "../../assets/icons/pill.svg";
import { useRef, useState } from "react";
import { Medication } from "../../types/medication";
import { MED_FORMS } from "../../constants/medication-forms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "./components/NextButton";
import AddMedicationHeader from "./components/AddMedicationHeader";

type FormErrors = {
  medName?: string;
  selectedForm?: string;
};

const Step1Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { draft, setDraft } = useMedicationStore();
  const [selectedForm, setSelectedForm] = useState<Medication["form"]>(
    draft.form ?? "capsule",
  );
  const [medName, setMedName] = useState<Medication["name"]>(draft.name ?? "");
  const [errors, setErrors] = useState<FormErrors>();
  const [showFormPicker, setShowFormPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const route = useRoute<any>();
  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;

  const validateForm = () => {
    let newErrors: FormErrors = {};
    if (!medName.trim()) newErrors.medName = "Medication name is required";
    if (!selectedForm) newErrors.selectedForm = "Medication form is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return medName.trim().length > 0 && selectedForm !== undefined;
  };

  const togglePicker = () => {
    const toValue = showFormPicker ? 0 : 1;
    setShowFormPicker(!showFormPicker);
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: false,
      bounciness: 6,
    }).start();
  };

  const handleSelectForm = (formId: string) => {
    setSelectedForm(formId as Medication["form"]);
    togglePicker();
  };

  const handleNextButton = () => {
    if (validateForm()) {
      setDraft({ name: medName.trim(), form: selectedForm });
      navigation.navigate("AddMedication", {
        screen: "Step2",
        params: { mode, medicationId },
      });
    }
  };

  const SelectedIcon =
    MED_FORMS.find((f) => f.id === selectedForm)?.Icon ?? PillIcon;

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraHeight={showFormPicker ? 32 : 8}
      extraScrollHeight={showFormPicker ? 32 : 8}
    >
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <AddMedicationHeader
          currentStep={1}
          title="Add Medication"
          showBackIcon={false}
        />

        {/* ------------------------------ Input Section ----------------------------- */}
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Pressable style={styles.circleIcon} onPress={togglePicker}>
              <SelectedIcon
                width={48}
                height={48}
                stroke={Colors.textPrimary}
              />
            </Pressable>
            <Text style={styles.formText}>{selectedForm}</Text>

            <Animated.View
              style={[
                styles.formPicker,
                {
                  opacity: slideAnim,
                  maxHeight: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 120],
                  }),
                  marginTop: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 16],
                  }),
                },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.formPickerContent}
              >
                {MED_FORMS.map(({ id, label, Icon }) => {
                  const isSelected = selectedForm === id;
                  return (
                    <Pressable
                      key={id}
                      style={[
                        styles.formItem,
                        isSelected && styles.formItemSelected,
                      ]}
                      onPress={() => handleSelectForm(id)}
                    >
                      <Icon
                        width={28}
                        height={28}
                        stroke={
                          isSelected ? Colors.primary : Colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.formLabel,
                          isSelected && styles.formLabelSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ----------------------------- Medication Name ---------------------------- */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Medication Name"
                placeholderTextColor={Colors.textSecondary}
                value={medName}
                onChangeText={setMedName}
              />
              {errors?.medName ? (
                <Text style={styles.errorText}>{errors.medName}</Text>
              ) : null}
            </View>
          </View>

          {/* ------------------------------- Next Button ------------------------------ */}
          <NextButton disabled={!isFormValid()} onPress={handleNextButton} />
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
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: -20,
  },
  inputContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  circleIcon: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    color: Colors.textPrimary,
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    fontSize: 16,
    textAlign: "center",
  },
  formPicker: {
    width: "100%",
    overflow: "hidden",
  },
  formPickerContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  formItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    marginRight: 8,
    minWidth: 64,
  },
  formItemSelected: {
    backgroundColor: Colors.primary + "22",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  formLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  formLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  formText: {
    fontSize: 16,
    textTransform: "capitalize",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: Colors.error,
  },
});

export default Step1Screen;
