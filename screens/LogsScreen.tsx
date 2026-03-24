import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavProp } from "../types/navigation";
import { useNavigation } from "@react-navigation/native";

const LogsScreen = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <SafeAreaView>
      <Text>Logs Screen</Text>
      <Button
        title="Settings"
        onPress={() =>
          navigation.navigate("Settings", { screen: "SettingsMain" })
        }
      />
    </SafeAreaView>
  );
};

export default LogsScreen;
