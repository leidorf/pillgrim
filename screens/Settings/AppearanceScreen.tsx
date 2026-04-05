import { StyleSheet, Text } from "react-native";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";

const AppearanceScreen = () => {
  return (
    <ScreenLayout>
      <ScreenHeader title="Appearance" />
      <Text>Appearance Screen</Text>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({});

export default AppearanceScreen;
