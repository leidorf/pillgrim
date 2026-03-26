import { useNavigation } from "@react-navigation/native";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import CloseIcon from "../../assets/icons/close.svg";
import PillIcon from "../../assets/icons/pill.svg";
import { useRef, useState } from "react";
import { Medication } from "../../types/medication";
import { MED_FORMS } from "../../constants/medication-forms";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "../../components/NextButton";

type FormErrors = {
  medName?: Medication["name"];
  selectedForm?: Medication["form"];
};

const Step1Screen = () => {
  const navigation = useNavigation<NavProp>();
  const [selectedForm, setSelectedForm] = useState<Medication["form"]>("pill");
  const [medName, setMedName] = useState<Medication["name"]>("");
  const [errors, setErrors] = useState<FormErrors>();
  const [showFormPicker, setShowFormPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { draft, setDraft } = useMedicationStore();

  const validateForm = () => {
    let errors: FormErrors = {};
    if (!medName) errors.medName = "Medication name is required";
    if (!selectedForm) errors.selectedForm = "Medication form is required";

    setErrors(errors);

    return Object.keys(errors).length === 0;
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
      setDraft({ name: medName, form: selectedForm });
      navigation.navigate("AddMedication", { screen: "Step2" });
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Medication</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

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
                    outputRange: [0, 100],
                  }),
                  marginTop: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 16],
                  }),
                },
              ]}
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
                    {errors?.selectedForm ? (
                      <Text style={styles.errorText}>
                        {errors?.selectedForm}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
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
                <Text style={styles.errorText}>{errors?.medName}</Text>
              ) : null}
            </View>
          </View>

          {/* ------------------------------- Next Button ------------------------------ */}

          <NextButton disabled={!validateForm} onPress={handleNextButton} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
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
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },
  formItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
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
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    color: Colors.error,
  },
});

export default Step1Screen;
