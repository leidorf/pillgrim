import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";

type LogsScreenNavigationProp = BottomTabScreenProps<
  RootStackParamList,
  "Logs"
>;

const LogsScreen = ({ navigation, route }: LogsScreenNavigationProp) => {
  return (
    <SafeAreaView>
      <Text>Logs Screen</Text>
    </SafeAreaView>
  );
};

export default LogsScreen;
