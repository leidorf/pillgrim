import { useNavigation } from "@react-navigation/native";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import CloseIcon from "../../assets/icons/close.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import { useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMedicationStore } from "../../store/medicationStore";
import { TIER1_SCHEDULES, TIER2_SCHEDULES } from "../../constants/schedules";
import { Schedule, ScheduleType } from "../../types/medication";
import RightArrowIcon from "../../assets/icons/arrow-right.svg";

const Step2Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { setDraft } = useMedicationStore();
  const [isOnOtherView, setIsOnOtherView] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(
    null,
  );
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToOther = () => {
    setIsOnOtherView(true);
    Animated.spring(slideAnim, {
      toValue: -1,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const goBack = () => {
    setIsOnOtherView(false);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const handleSelectSchedule = (id: ScheduleType) => {
    setSelectedSchedule(id);
    const schedule: Schedule = {
      type: id,
      startDate: new Date().toISOString(),
    };
    setDraft({ schedule });
  };

  const handleSelectFromOther = (id: ScheduleType) => {
    handleSelectSchedule(id);
    goBack();
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraHeight={8}
      extraScrollHeight={8}
    >
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (isOnOtherView) {
                goBack();
              } else {
                navigation.goBack();
              }
            }}
          >
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Medication</Text>
          <Pressable onPress={() => navigation.getParent()?.goBack()}>
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.sliderWrapper,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-1, 0],
                      outputRange: ["-100%", "0%"],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* -------------------------------- Main View ------------------------------- */}
            <View style={styles.slide}>
              <Text style={styles.sectionLabel}>How often?</Text>
              <View style={styles.optionList}>
                {TIER1_SCHEDULES.map(({ id, label }) => (
                  <Pressable
                    key={id}
                    style={[
                      styles.scheduleButton,
                      selectedSchedule === id && styles.scheduleButtonSelected,
                    ]}
                    onPress={() => handleSelectSchedule(id)}
                  >
                    <Text
                      style={[
                        styles.scheduleText,
                        selectedSchedule === id && styles.scheduleTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}

                <Pressable style={styles.scheduleButton} onPress={goToOther}>
                  <Text style={styles.scheduleText}>
                    Other <RightArrowIcon height={14} width={14} />
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ------------------------------- Others View ------------------------------ */}
            <View style={styles.slide}>
              <Pressable onPress={goBack} style={styles.backRow}>
                <BackIcon
                  height={18}
                  width={18}
                  stroke={Colors.textSecondary}
                />
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>
              <Text style={styles.sectionLabel}>Other options</Text>
              <View style={styles.optionList}>
                {TIER2_SCHEDULES.map(({ id, label }) => (
                  <Pressable
                    key={id}
                    style={[
                      styles.scheduleButton,
                      selectedSchedule === id && styles.scheduleButtonSelected,
                    ]}
                    onPress={() => handleSelectFromOther(id)}
                  >
                    <Text
                      style={[
                        styles.scheduleText,
                        selectedSchedule === id && styles.scheduleTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* ------------------------------- Next Button ------------------------------ */}
          <Pressable
            style={[
              styles.nextButton,
              !selectedSchedule && styles.nextButtonDisabled,
            ]}
            disabled={!selectedSchedule}
            onPress={() =>
              navigation.navigate("AddMedication", { screen: "Step3" })
            }
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  sliderWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "200%",
  },
  slide: {
    width: "50%",
    paddingTop: 20,
    gap: 16,
  },
  sectionLabel: {
    color: Colors.textPrimary,
    fontSize: 22,
  },
  optionList: {
    gap: 12,
  },
  scheduleButton: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.surface,
  },
  scheduleButtonSelected: {
    backgroundColor: Colors.primary + "22",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: "500",
    textTransform: "capitalize",
    textAlign: "center",
    color: Colors.textPrimary,
  },
  scheduleTextSelected: {
    color: Colors.primary,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  nextButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    textAlign: "center",
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Step2Screen;
