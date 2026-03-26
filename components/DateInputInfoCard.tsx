import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";

type InfoCardProps = {
  cardText: string;
  cardLabel: string;
  onPress: () => void;
  isEmpty: boolean;
};

const DateInputInfoCard = ({
  cardText,
  cardLabel,
  onPress,
  isEmpty,
}: InfoCardProps) => {
  return (
    <View style={styles.expandedContainer}>
      <Text style={styles.expandedLabel}>{cardLabel}</Text>
      <Pressable style={styles.dateInput} onPress={onPress}>
        <Text
          style={[styles.dateText, isEmpty && { color: Colors.textSecondary }]}
        >
          {cardText}
        </Text>
      </Pressable>
    </View>
  );
};

export default DateInputInfoCard;

const styles = StyleSheet.create({
  expandedContainer: {
    backgroundColor: Colors.primary + "0D",
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  expandedLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
  },
  expandedInfoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  dateInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
});
