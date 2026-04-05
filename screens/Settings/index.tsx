import { useNavigation } from "@react-navigation/native";
import { FlatList, Linking, StyleSheet, Text, View } from "react-native";
import { NavProp, SettingsParamList } from "../../types/navigation";
import ScreenHeader from "./components/ScreenHeader";
import NavigationButton from "./components/NavigationButton";
import ScreenLayout from "../../components/ScreenLayout";

const SettingsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const screenNames: (keyof SettingsParamList)[] = [
    "Notifications",
    "Alarm",
    "Appearance",
    "Language",
  ];
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
            <Text onPress={handlePrivacy}>Privacy Policy</Text>
            <Text> - </Text>
            <Text onPress={handleAbout}>About</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default SettingsScreen;
