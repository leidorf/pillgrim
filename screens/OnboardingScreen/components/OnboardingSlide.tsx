import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../theme/useAppTheme";
import { OnboardingSlideConfig } from "../types";

type OnboardingSlideProps = {
  config: OnboardingSlideConfig;
};

export const OnboardingSlide = ({ config }: OnboardingSlideProps) => {
  const { key, Mock } = config;
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <View style={styles.slide}>
      <View style={styles.mockArea} pointerEvents="none">
        <Mock />
      </View>

      <View style={styles.textArea}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t(`onboarding.${key}.title`)}
        </Text>
        <Text style={[styles.desc, { color: theme.textMuted }]}>
          {t(`onboarding.${key}.desc`)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  mockArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  textArea: { paddingBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  desc: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
