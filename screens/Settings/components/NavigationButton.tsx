import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import ArrowRight from "../../../assets/icons/chevron-right.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type ButtonProps = {
  icon?: React.ReactNode;
  title: string;
  subtext?: string;
  onPress: () => void;
};

const NavigationButton = ({ icon, title, subtext, onPress }: ButtonProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress} style={styles.button}>
      <View style={styles.leftContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </View>
      </View>
      <ArrowRight height={24} width={24} stroke={theme.textPrimary} />
    </Pressable>
  );
};

export default NavigationButton;

const createStyles = (theme: Theme) => StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    color: theme.textPrimary,
  },
  subtext: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});
