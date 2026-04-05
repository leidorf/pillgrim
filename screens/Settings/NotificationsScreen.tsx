import { StyleSheet, Text } from "react-native";
import ScreenHeader from "./components/ScreenHeader";
import ScreenLayout from "../../components/ScreenLayout";

const NotificationsScreen = () => {
  return (
    <ScreenLayout>
      <ScreenHeader title="Notifications" />
      <Text>Notifications Screen</Text>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({});

export default NotificationsScreen;
