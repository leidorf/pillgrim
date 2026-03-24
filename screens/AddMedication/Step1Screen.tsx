import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Step1Screen = () => {
  return (
    <SafeAreaView>
      <Text>Add Medication Step 1</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
});

export default Step1Screen;
