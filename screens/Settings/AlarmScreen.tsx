import { StyleSheet, Text } from "react-native";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";

const AlarmScreen = () => {
  return (
    <ScreenLayout>
      <ScreenHeader title="Appearance" />
      <Text>Alarm Screen</Text>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({});

export default AlarmScreen;
