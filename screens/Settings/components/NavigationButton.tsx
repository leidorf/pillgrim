import { Pressable, StyleSheet, Text, View } from "react-native";
import ArrowRight from "../../../assets/icons/chevron-right.svg";
import { Colors } from "../../../constants/theme";

type ButtonProps = {
  icon?: React.ReactNode;
  title: string;
  subtext?: string;
  onPress: () => void;
};

const NavigationButton = ({ icon, title, subtext, onPress }: ButtonProps) => {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <View style={styles.leftContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </View>
      </View>
      <ArrowRight height={24} width={24} stroke={Colors.textPrimary} />
    </Pressable>
  );
};

export default NavigationButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
  },
  subtext: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
