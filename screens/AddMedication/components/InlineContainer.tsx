import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../constants/theme";
import { PropsWithChildren } from "react";

type ContainerProps = {
  containerText: string;
};

const InlineContainer = ({
  containerText,
  children,
}: PropsWithChildren<ContainerProps>) => {
  return (
    <View style={styles.expandedContainer}>
      <Text style={children ? styles.expandedLabel : styles.expandedInfoText}>
        {containerText}
      </Text>
      {children}
    </View>
  );
};

export default InlineContainer;

const styles = StyleSheet.create({
  expandedContainer: {
    backgroundColor: Colors.primary + "0D",
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  expandedLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
  },
  expandedInfoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
