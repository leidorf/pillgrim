import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressBar } from "../../AddMedication/components/ProgressBar";
import { OnboardingNavButton } from "./OnboardingNavButton";

type Props = {
  page: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export const OnboardingFooter = ({
  page,
  totalPages,
  isFirst,
  isLast,
  onPrevious,
  onNext,
}: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 16 }]}>
      <ProgressBar count={totalPages} currentStep={page + 1} />

      <View style={styles.navRow}>
        <OnboardingNavButton
          label={t("common.previous")}
          onPress={onPrevious}
          disabled={isFirst}
          hidden={isFirst}
          variant="muted"
        />
        <OnboardingNavButton
          label={isLast ? t("common.finish") : t("common.next")}
          onPress={onNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingTop: 12, gap: 8 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
});
