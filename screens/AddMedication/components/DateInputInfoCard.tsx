import { Pressable, StyleSheet } from "react-native";
import { Text } from "../../../components/Text";
import { Colors } from "../../../constants/theme";
import InlineContainer from "./InlineContainer";

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
    <InlineContainer containerText={cardLabel}>
      <Pressable style={styles.dateInput} onPress={onPress}>
        <Text
          style={[
            styles.dateText,
            isEmpty && { color: Colors.textSecondary },
          ]}
        >
          {cardText}
        </Text>
      </Pressable>
    </InlineContainer>
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
  dateInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  dateText: {
    color: Colors.textPrimary,
    fontWeight: "500",
    fontSize: 14,
  },
});
