import { useNavigation } from "@react-navigation/native";
import { FlatList, Linking, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import { NavProp, SettingsParamList } from "../../types/navigation";
import ScreenHeader from "./components/ScreenHeader";
import NavigationButton from "./components/NavigationButton";
import ScreenLayout from "../../components/ScreenLayout";
import { useAppTheme } from "../../theme/useAppTheme";
import { useMemo } from "react";
import { Theme } from "../../constants/theme";

const SettingsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const screenNames: (keyof SettingsParamList)[] = [
    "Notifications",
    "Alarm",
    "Appearance",
    "Language",
  ];
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleNavigation = (screenName: keyof SettingsParamList) => {
    navigation.navigate("Settings", { screen: screenName });
  };
  const handlePrivacy = () => {
    Linking.openURL("https://github.com/leidorf/medication-reminder");
  };
  const handleAbout = () => {
    Linking.openURL("https://github.com/leidorf");
  };
  return (
    <ScreenLayout>
      <ScreenHeader title="Settings" />
      <FlatList
        data={screenNames}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NavigationButton
            title={item}
            onPress={() => handleNavigation(item)}
          />
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text onPress={handlePrivacy} style={styles.footerText}>
              Privacy Policy
            </Text>
            <Text style={styles.footerText}> - </Text>
            <Text onPress={handleAbout} style={styles.footerText}>
              About
            </Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 24,
      gap: 8,
    },
    footer: {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    footerText: {
      color: theme.textPrimary,
    },
  });

export default SettingsScreen;
