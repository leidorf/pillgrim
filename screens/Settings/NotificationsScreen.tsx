import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings.notifications")} />
      <View style={styles.content}>
        <Text style={styles.text}>{t("settings.notifications")}</Text>
      </View>
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      color: theme.textSecondary,
      fontSize: 16,
    },
  });

export default NotificationsScreen;
