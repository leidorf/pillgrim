import { View, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../../constants/theme";

type Props = {
  currentStep: 1 | 2 | 3 | 4;
  steps?: string[];
};
const windowWidth = Dimensions.get("window").width;

const ProgressBar = ({ currentStep }: Props) => {
  const steps = [1, 2, 3, 4];
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;
        const isLast = index === steps.length - 1;

        return (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.dot,
                (isActive || isCompleted) && styles.dotActive,
              ]}
            />

            {!isLast && (
              <View style={[styles.line, isCompleted && styles.lineActive]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 16,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary + "30",
  },
  dotActive: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.2 }],
  },
  line: {
    width: (windowWidth * 0.9) / 4,
    height: 2,
    backgroundColor: Colors.textSecondary + "20",
    marginHorizontal: 6,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
});
