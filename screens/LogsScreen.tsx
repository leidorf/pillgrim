import {
  Button,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavProp } from "../types/navigation";
import { useNavigation } from "@react-navigation/native";
import SettingsIcon from "../assets/icons/settings.svg";
import FileDownloadIcon from "../assets/icons/file-down.svg";
import { Colors } from "../constants/theme";

const LogsScreen = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable>
          <FileDownloadIcon
            height={24}
            width={24}
            stroke={Colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerText}>March</Text>
        <Pressable
          onPress={() =>
            navigation.navigate("Settings", { screen: "SettingsMain" })
          }
        >
          <SettingsIcon height={24} width={24} stroke={Colors.textPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LogsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 32,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 600,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
