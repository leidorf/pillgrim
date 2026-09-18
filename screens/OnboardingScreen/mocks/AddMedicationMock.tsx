import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/Text";
import CirclePlusIcon from "../../../assets/icons/circle-plus.svg";
import { Theme } from "../../../constants/theme";
import { useAppTheme } from "../../../theme/useAppTheme";

export const AddMedicationMock = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>{t("medication.addMedication")}</Text>
      <CirclePlusIcon height={24} width={24} color={theme.surface} />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 24,
      backgroundColor: theme.primary,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    text: {
      color: theme.surface,
    },
  });
