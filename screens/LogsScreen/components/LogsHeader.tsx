import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../constants/theme";

import FileDownloadIcon from "../../../assets/icons/file-down.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";

import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../../../types/navigation";

type HeaderProps = {
  headerText: string;
};

const handleExport = () => {
  console.log("Export logs");
};

const LogsHeader = ({ headerText }: HeaderProps) => {
  const navigation = useNavigation<NavProp>();
  return (
    <View style={styles.topBar}>
      {/* ----------------------------- Download Button ---------------------------- */}
      <Pressable style={styles.iconButton} onPress={handleExport}>
        <FileDownloadIcon height={24} width={24} stroke={Colors.textPrimary} />
      </Pressable>

      {/* ------------------------------- Header Text ------------------------------ */}
      <Text style={styles.headerText}>{headerText}</Text>

      {/* ----------------------- Settings Navigation Button ----------------------- */}
      <Pressable
        style={styles.iconButton}
        onPress={() =>
          navigation.navigate("Settings", { screen: "SettingsMain" })
        }
      >
        <SettingsIcon height={24} width={24} stroke={Colors.textPrimary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  iconButton: {
    padding: 8,
  },
});

export default LogsHeader;
