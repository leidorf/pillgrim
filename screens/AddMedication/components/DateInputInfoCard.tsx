import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "../../../components/Text";
import InlineContainer from "./InlineContainer";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

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
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <InlineContainer containerText={cardLabel}>
      <Pressable style={styles.dateInput} onPress={onPress}>
        <Text
          style={[
            styles.dateText,
            isEmpty && { color: theme.textSecondary },
          ]}
        >
          {cardText}
        </Text>
      </Pressable>
    </InlineContainer>
  );
};

export default DateInputInfoCard;

const createStyles = (theme: Theme) => StyleSheet.create({
  dateInput: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  dateText: {
    color: theme.textPrimary,
    fontWeight: "500",
    fontSize: 14,
  },
});
