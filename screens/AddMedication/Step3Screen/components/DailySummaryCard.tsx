import { StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import { Colors } from "../../../../constants/theme";

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
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        Daily Schedule
      </Text>
      {doses.map((dose) => (
        <View key={dose.id} style={styles.row}>
          <Text style={styles.time}>
            {formatTime(dose.time)}
          </Text>
          <Text style={styles.dose}>
            {dose.amount} {unitLabel}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  heading: {
    color: Colors.textSecondary,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "20",
  },
  time: { color: Colors.textPrimary, fontWeight: "600", fontSize: 16 },
  dose: { color: Colors.primary, fontSize: 14 },
});
