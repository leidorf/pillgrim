import { Pressable, StyleSheet, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTranslation } from "react-i18next";
import ScreenLayout from "../../components/ScreenLayout";
import { useAppTheme } from "../../theme/useAppTheme";
import { OnboardingFooter } from "./components/OnboardingFooter";
import { OnboardingSlide } from "./components/OnboardingSlide";
import { ONBOARDING_SLIDES } from "./constants";
import { useOnboardingPager } from "../../hooks/useOnboardingPager";

type Props = {
  onDone: () => void;
};

export default function OnboardingScreen({ onDone }: Props) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const totalPages = ONBOARDING_SLIDES.length;

  const {
    pagerRef,
    page,
    isFirst,
    isLast,
    goNext,
    goPrevious,
    handlePageSelected,
  } = useOnboardingPager({ totalPages, onComplete: onDone });

  return (
    <ScreenLayout style={{ backgroundColor: theme.background }}>
      <View style={[styles.skipRow]}>
        <Pressable onPress={onDone} hitSlop={12}>
          <Text style={[styles.skipLabel, { color: theme.textMuted }]}>
            {t("common.skip")}
          </Text>
        </Pressable>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => handlePageSelected(e.nativeEvent.position)}
      >
        {ONBOARDING_SLIDES.map((config) => (
          <View key={config.key} style={styles.page}>
            <OnboardingSlide config={config} />
          </View>
        ))}
      </PagerView>

      <OnboardingFooter
        page={page}
        totalPages={totalPages}
        isFirst={isFirst}
        isLast={isLast}
        onPrevious={goPrevious}
        onNext={goNext}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  skipRow: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  skipLabel: { fontSize: 15 },
  pager: { flex: 1 },
  page: { flex: 1 },
});
