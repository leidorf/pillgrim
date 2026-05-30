import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  visible: boolean;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onClose: () => void;
};

const ExportModal = ({ visible, onExportCSV, onExportPDF, onClose }: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("export.title")}</Text>
          <View style={styles.separator} />

          <Pressable style={styles.option} onPress={onExportCSV}>
            <Text style={styles.optionText}>{t("export.csv")}</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={onExportPDF}>
            <Text style={styles.optionText}>{t("export.pdf")}</Text>
          </Pressable>

          <Pressable style={[styles.option, styles.cancelOption]} onPress={onClose}>
            <Text style={[styles.optionText, styles.cancelText]}>
              {t("export.cancel")}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: 20,
      width: "100%",
      maxWidth: 280,
      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontWeight: "700",
      color: theme.textPrimary,
      paddingHorizontal: 4,
      fontSize: 18,
    },
    separator: {
      height: 1,
      backgroundColor: theme.textSecondary + "20",
      marginVertical: 10,
    },
    option: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    optionText: {
      color: theme.textPrimary,
      fontSize: 16,
    },
    cancelOption: {
      backgroundColor: theme.background,
      marginTop: 8,
    },
    cancelText: {
      color: theme.error,
      textAlign: "center",
      fontWeight: "600",
    },
  });

export default ExportModal;
