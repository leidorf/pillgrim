import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "./Text";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";
import { logger } from "../utils/logger";
import { useTranslation } from "react-i18next";
import CircleCloseIcon from "../assets/icons/circle-close.svg";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRestart={this.handleRestart} />;
    }
    return this.props.children;
  }
}

const ErrorFallback = ({ onRestart }: { onRestart: () => void }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <CircleCloseIcon
        width={56}
        height={56}
        stroke={theme.error}
        strokeWidth={1.5}
      />
      <Text style={styles.title}>{t("error.title")}</Text>
      <Text style={styles.subtitle}>{t("error.subtitle")}</Text>
      <Pressable style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>{t("error.restart")}</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.textPrimary,
      marginTop: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
    },
    button: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default ErrorBoundary;
