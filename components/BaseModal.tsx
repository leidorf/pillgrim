import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";

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
                style={[
                  styles.button,
                  isHorizontal && styles.buttonRow,
                  !isHorizontal &&
                    index < buttons.length - 1 &&
                    styles.buttonBorderBottom,
                ]}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.textSecondary + "20",
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
  buttonBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "20",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    fontWeight: "700",
    color: Colors.primary,
  },
  textDestructive: {
    color: Colors.error || "#EF4444",
  },
});

export default BaseModal;
