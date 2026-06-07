import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { NavProp } from "../types/navigation";
import CirclePlusIcon from "../assets/icons//circle-plus.svg";
import { Theme } from "../constants/theme";
import { useAppTheme } from "../theme/useAppTheme";
import { useTranslation } from "react-i18next";

const AddMedicationButton = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavProp>();
  return (
    <Pressable
      style={styles.container}
      onPress={() => navigation.navigate("AddMedication", { screen: "Step1" })}
    >
      <Text style={styles.text}>{t("medication.addMedication")}</Text>
      <CirclePlusIcon height={24} width={24} color={theme.surface} />
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: "6%",
      right: "3%",
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 24,
      backgroundColor: theme.primary,
      gap: 8,
    },
    text: {
      color: theme.surface,
    },
  });

export default AddMedicationButton;
