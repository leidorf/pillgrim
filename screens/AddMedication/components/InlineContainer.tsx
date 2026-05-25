import { StyleSheet, View } from "react-native";
import { useMemo, PropsWithChildren } from "react";
import { Text } from "../../../components/Text";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type ContainerProps = {
  containerText: string;
};

const InlineContainer = ({
  containerText,
  children,
}: PropsWithChildren<ContainerProps>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme: Theme) => StyleSheet.create({
  expandedContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  textStyle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  expandedLabel: {
    marginBottom: 10,
  },
  expandedInfoText: {
    lineHeight: 20,
  },
});
