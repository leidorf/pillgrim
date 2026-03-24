import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";

type HomeScreenNavigationProp = BottomTabScreenProps<
  RootStackParamList,
  "Home"
>;

const HomeScreen = ({ navigation, route }: HomeScreenNavigationProp) => {
  return (
    <SafeAreaView>
      <Text>Home Screen</Text>
    </SafeAreaView>
  );
};

export default HomeScreen;