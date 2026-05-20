import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors } from "../../../constants/theme";
import { useMedicationStore } from "../../../store/medicationStore";

import BackIcon from "../../../assets/icons/arrow-left.svg";
import CloseIcon from "../../../assets/icons/close.svg";
import ProgressBar from "./ProgressBar";

type AddMedicationHeaderProps = {
  currentStep: 1 | 2 | 3 | 4;
  title: string;
  showBackIcon?: boolean;
  onBack?: () => void;
};

const AddMedicationHeader = ({
  currentStep,
  title,
  showBackIcon = currentStep !== 1,
  onBack,
}: AddMedicationHeaderProps) => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { clearDraft } = useMedicationStore();
  const mode = route.params?.mode;

  const handleClose = () => {
    if (mode !== "edit") {
      clearDraft();
    }
    navigation.getParent()?.goBack();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <View style={styles.header}>
        {showBackIcon ? (
          <Pressable onPress={handleBack} style={styles.headerIcon}>
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        <Pressable onPress={handleClose} style={styles.headerIcon}>
          <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
        </Pressable>
      </View>

      <ProgressBar currentStep={currentStep} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    padding: 4,
    minWidth: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 24,
    height: 24,
  },
});

export default AddMedicationHeader;
