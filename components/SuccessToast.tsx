import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import CheckIcon from "../assets/icons/check.svg";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";

type Props = {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss: () => void;
};

const SuccessToast = ({
  visible,
  message,
  duration = 3000,
  onDismiss,
}: Props) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDismissed = useRef(false);

  useEffect(() => {
    if (visible) {
      hasDismissed.current = false;

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const dismiss = () => {
    if (hasDismissed.current) return;
    hasDismissed.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const styles = getStyles(theme, insets.top);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], opacity }]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <CheckIcon width={18} height={18} stroke={theme.primary} />
      <Text style={styles.text} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
};

const getStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      top: topInset + 12,
      left: 20,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.surfaceElevated,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 9999,
    },
    text: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },
  });

export default SuccessToast;
