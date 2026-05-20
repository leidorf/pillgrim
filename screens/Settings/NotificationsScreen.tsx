import { StyleSheet } from "react-native";
import { Text } from "../../components/Text";
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
