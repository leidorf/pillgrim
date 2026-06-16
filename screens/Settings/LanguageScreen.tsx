import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Text } from "../../components/Text";
import { useTranslation } from "react-i18next";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { useSettingsStore, LanguageSetting } from "../../store/settingsStore";
import { LANGUAGES, SYSTEM_DEFAULT, getSystemLanguage } from "../../utils/i18n";
import CheckIcon from "../../assets/icons/check.svg";
import { useAppTheme } from "../../theme/useAppTheme";
import { Theme } from "../../constants/theme";

const LanguageScreen = () => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { language, setLanguage } = useSettingsStore();

  const systemLang = getSystemLanguage();
  const systemLabel = LANGUAGES.find((l) => l.code === systemLang)?.nativeLabel;

  const options: { value: LanguageSetting; label: string }[] = [
    {
      value: SYSTEM_DEFAULT,
      label: `${t("language.systemDefault")} (${systemLabel})`,
    },
    ...LANGUAGES.map((l) => ({
      value: l.code,
      label: `${l.nativeLabel} (${l.label})`,
    })),
  ];

  return (
    <ScreenLayout>
      <ScreenHeader title={t("language.title")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {options.map((option) => {
          const isActive = language === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => setLanguage(option.value)}
            >
              <Text
                style={[styles.itemText, isActive && styles.itemTextActive]}
              >
                {option.label}
              </Text>
              {isActive && (
                <CheckIcon width={18} height={18} stroke={theme.primary} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: {
      paddingHorizontal: 24,
      paddingTop: 16,
      gap: 4,
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    itemActive: {
      backgroundColor: theme.primary + "10",
    },
    itemText: {
      fontSize: 16,
      color: theme.textPrimary,
    },
    itemTextActive: {
      color: theme.primaryDark,
      fontWeight: "600",
    },
  });

export default LanguageScreen;
