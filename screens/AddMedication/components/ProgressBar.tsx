import { Fragment, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  count: number;
  currentStep: number;
};

export const ProgressBar = ({ count, currentStep }: Props) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => i + 1).map((step, index) => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;
        const isLast = index === count - 1;

        return (
          <Fragment key={step}>
            <View
              style={[
                styles.dot,
                (isActive || isCompleted) && styles.dotActive,
              ]}
            />
            {!isLast && (
              <View style={[styles.line, isCompleted && styles.lineActive]} />
            )}
          </Fragment>
        );
      })}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 16,
      paddingHorizontal: 24,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.textSecondary + "30",
    },
    dotActive: {
      backgroundColor: theme.primary,
      transform: [{ scale: 1.2 }],
    },
    line: {
      flex: 1,
      height: 2,
      backgroundColor: theme.textSecondary + "20",
      marginHorizontal: 6,
    },
    lineActive: {
      backgroundColor: theme.primary,
    },
  });
