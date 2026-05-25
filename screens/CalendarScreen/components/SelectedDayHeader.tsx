import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type DayHeaderProps = {
  selectedDate: string;
};

const SelectedDayHeader = ({ selectedDate }: DayHeaderProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.detailHeader}>
      <Text style={styles.detailDate}>{selectedDate}</Text>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.textPrimary,
    textTransform: "capitalize",
  },
});

export default SelectedDayHeader;
