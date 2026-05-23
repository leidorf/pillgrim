import { StyleSheet, View } from "react-native";
import { Colors } from "../../../constants/theme";
import { PropsWithChildren } from "react";
import { Text } from "../../../components/Text";

type ContainerProps = {
  containerText: string;
};

const InlineContainer = ({
  containerText,
  children,
}: PropsWithChildren<ContainerProps>) => {
  return (
    <View style={styles.expandedContainer}>
      <Text
        style={[
          styles.textStyle,
          children ? styles.expandedLabel : styles.expandedInfoText,
        ]}
      >
        {containerText}
      </Text>
      {children}
    </View>
  );
};

export default InlineContainer;

const styles = StyleSheet.create({
  expandedContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textStyle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  expandedLabel: {
    marginBottom: 10,
  },
  expandedInfoText: {
    lineHeight: 20,
  },
});
