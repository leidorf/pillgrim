import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type Props = {
  style?: StyleProp<ViewStyle>;
};

const ScreenLayout = ({ style, children }: PropsWithChildren<Props>) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top / 2 }, style]}
    >
      {children}
    </SafeAreaView>
  );
};

export default ScreenLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
