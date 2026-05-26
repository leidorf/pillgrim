import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type DoseEntry = {
  id: string;
  time: Date;
  amount: string;
};

type Props = {
  doses: DoseEntry[];
  unitLabel: string;
  formatTime: (date: Date) => string;
};

export const DailySummaryCard = ({ doses, unitLabel, formatTime }: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{t("addMedication.dailySchedule")}</Text>
      {doses.map((dose, index) => (
        <View
          key={dose.id}
          style={[styles.row, index < doses.length - 1 && styles.rowDivider]}
        >
          <Text style={styles.time}>{formatTime(dose.time)}</Text>
          <Text style={styles.dose}>
            {dose.amount} {unitLabel}
          </Text>
        </View>
      ))}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.primary + "40",
  },
  heading: {
    color: theme.textSecondary,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.textSecondary + "20",
  },
  time: { color: theme.textPrimary, fontWeight: "600", fontSize: 16 },
  dose: { color: theme.primaryDark, fontSize: 14 },
});
