import { StyleSheet, Text } from "react-native";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";

const LanguageScreen = () => {
  return (
    <ScreenLayout>
      <ScreenHeader title="Appearance" />
      <Text>Language Screen</Text>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({});

export default LanguageScreen;
