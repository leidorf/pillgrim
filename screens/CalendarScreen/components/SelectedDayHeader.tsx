import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { Colors } from "../../../constants/theme";

type DayHeaderProps = {
  selectedDate: string;
};

const SelectedDayHeader = ({ selectedDate }: DayHeaderProps) => {
  return (
    <View style={styles.detailHeader}>
      <Text style={styles.detailDate}>{selectedDate}</Text>
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
});

export default SelectedDayHeader;
