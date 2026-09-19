import { Image, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../../theme/useAppTheme";

const ICON_SOURCE = require("../../../assets/icon.png");

export const WelcomeMock = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Image
        source={ICON_SOURCE}
        style={[styles.icon, { borderColor: theme.textSecondary + "20" }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 140,
    height: 140,
    borderRadius: 24,
    borderWidth: 1,
  },
});
