import { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import BackIcon from "../../../assets/icons/arrow-left.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  title: string;
  onBack?: () => void;
};

const ScreenHeader = ({ title, onBack }: Props) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Pressable onPress={handleBack} hitSlop={8}>
        <BackIcon width={24} height={24} stroke={theme.textPrimary} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: "transparent",
    },
    title: {
      fontSize: 24,
      fontWeight: "500",
      color: theme.textPrimary,
      textAlign: "center",
      flex: 1,
    },
    rightPlaceholder: {
      width: 24,
    },
  });

export default ScreenHeader;
