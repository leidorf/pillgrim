import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../constants/theme";

type DayHeaderProps = {
  hasLogs: boolean;
  selectedDate: string;
  adherenceRate: number;
};

const SelectedDayHeader = ({
  hasLogs,
  selectedDate,
  adherenceRate,
}: DayHeaderProps) => {
  return (
    <View style={styles.detailHeader}>
      <Text style={styles.detailDate}>{selectedDate}</Text>
      {hasLogs && (
        <View
          style={[
            styles.adherenceBadge,
            {
              backgroundColor:
                adherenceRate === 100
                  ? Colors.success
                  : adherenceRate > 0
                    ? Colors.warning
                    : Colors.error,
            },
          ]}
        >
          <Text style={styles.adherenceText}>%{adherenceRate}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },
  adherenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adherenceText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SelectedDayHeader;
