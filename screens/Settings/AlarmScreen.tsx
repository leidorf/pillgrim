import { StyleSheet } from "react-native";
import { Text } from "../../components/Text";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";

const AlarmScreen = () => {
  return (
    <ScreenLayout>
      <ScreenHeader title="Alarm" />
      <Text>Alarm Screen</Text>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({});

export default AlarmScreen;
