import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import CloseIcon from "../../assets/icons/close.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "../../components/NextButton";

const Step3Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { draft, setDraft } = useMedicationStore();

  const handleBackButton = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable onPress={handleBackButton}>
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Time & Dose</Text>
          <Pressable onPress={() => navigation.getParent()?.goBack()}>
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* ------------------------------- Next Button ------------------------------ */}
          <NextButton onPress={() => console.log(draft)} />
        </View>
      </View>
    </View>
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
    overflow: "hidden",
  },
  sliderWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "200%",
  },
  slide: {
    width: "50%",
    paddingTop: 20,
    gap: 16,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 22,
  },
  optionList: {
    gap: 12,
  },
  scheduleButton: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
  },
  scheduleButtonSelected: {
    backgroundColor: Colors.primary + "22",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: "500",
    textTransform: "capitalize",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  scheduleTextSelected: {
    color: Colors.primary,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    textAlign: "center",
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Step3Screen;
