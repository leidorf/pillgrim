import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../../components/Text";
import { ScheduleType } from "../../../../types/schedule";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Props = {
  id: ScheduleType;
  label: string;
  isSelected: boolean;
  onPress: (id: ScheduleType) => void;
  children?: React.ReactNode;
};

export const ScheduleButton = ({
  id,
  label,
  isSelected,
  onPress,
  children,
}: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <Pressable
        style={[styles.button, isSelected && styles.buttonSelected]}
        onPress={() => onPress(id)}
      >
        <Text style={[styles.label, isSelected && styles.labelSelected]}>
          {label}
        </Text>
      </Pressable>

      {isSelected && children}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonSelected: {
    backgroundColor: theme.primary + "15",
    borderColor: theme.primary,
  },
  label: {
    color: theme.textPrimary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  labelSelected: {
    color: theme.primaryDark,
    fontWeight: "600",
  },
});
