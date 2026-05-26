import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";

export type ModalButton = {
  text: string;
  onPress: () => void;
  variant?: "default" | "primary" | "destructive";
};

type BaseModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: ModalButton[];
  onDismiss?: () => void;
};

const BaseModal = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}: BaseModalProps) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isHorizontal = buttons.length <= 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View
            style={[
              styles.buttonContainer,
              isHorizontal && styles.buttonContainerRow,
            ]}
          >
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                style={[styles.button, isHorizontal && styles.buttonRow]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.variant === "primary" && styles.textPrimary,
                    button.variant === "destructive" && styles.textDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: 20,
      width: "100%",
      maxWidth: 320,
      paddingTop: 24,
      paddingHorizontal: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    buttonContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.textSecondary + "20",
    },
    buttonContainerRow: {
      flexDirection: "row",
    },
    button: {
      paddingVertical: 16,
      alignItems: "center",
    },
    buttonRow: {
      flex: 1,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    textPrimary: {
      fontWeight: "700",
      color: theme.primaryDark,
    },
    textDestructive: {
      color: theme.error,
    },
  });

export default BaseModal;
