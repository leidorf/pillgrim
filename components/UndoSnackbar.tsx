import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";
import { Text } from "./Text";

type Props = {
  visible: boolean;
  name: string;
  durationMs?: number;
  onUndo: () => void;
  onDismiss: () => void;
};

const UndoSnackbar = ({
  visible,
  name,
  durationMs = 4500,
  onUndo,
  onDismiss,
}: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDismissed = useRef(false);

  useEffect(() => {
    if (visible) {
      hasDismissed.current = false;
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        dismiss();
      }, durationMs);
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
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
        toValue: 100,
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

  const handleUndo = () => {
    if (hasDismissed.current) return;
    hasDismissed.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onUndo();
    });
  };

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: insets.bottom, transform: [{ translateY }], opacity },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Text style={styles.text} numberOfLines={1}>
        {t("toast.medicationDeleted", { name })}
      </Text>
      <Pressable onPress={handleUndo} style={styles.undoButton}>
        <Text style={styles.undoText}>{t("toast.undo")}</Text>
      </Pressable>
    </Animated.View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surfaceElevated,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 8,
    },
    text: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: "500",
      marginRight: 12,
    },
    undoButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    undoText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: "700",
    },
  });

export default UndoSnackbar;
