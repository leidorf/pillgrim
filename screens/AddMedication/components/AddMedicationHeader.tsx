import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMedicationStore } from "../../../store/medicationStore";

import BackIcon from "../../../assets/icons/arrow-left.svg";
import CloseIcon from "../../../assets/icons/close.svg";
import ProgressBar from "./ProgressBar";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

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

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <View style={styles.header}>
        {showBackIcon ? (
          <Pressable onPress={handleBack} style={styles.headerIcon}>
            <BackIcon height={24} width={24} stroke={theme.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        <Pressable onPress={handleClose} style={styles.headerIcon}>
          <CloseIcon height={24} width={24} stroke={theme.textPrimary} />
        </Pressable>
      </View>

      <ProgressBar currentStep={currentStep} />
    </>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
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
    backgroundColor: theme.border,
  },
  headerTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 24,
    height: 24,
  },
});

export default AddMedicationHeader;
