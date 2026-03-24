import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";

type MedsScreenNavigationProp = BottomTabScreenProps<
  RootStackParamList,
  "Meds"
>;

const MedsScreen = ({ navigation, route }: MedsScreenNavigationProp) => {
  return (
    <SafeAreaView>
      <Text>Meds Screen</Text>
    </SafeAreaView>
  );
};

export default MedsScreen;