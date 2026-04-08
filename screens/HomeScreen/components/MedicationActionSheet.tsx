import { forwardRef, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors } from "../../../constants/theme";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import SkipIcon from "../../../assets/icons/circle-minus.svg";
import ClockIcon from "../../../assets/icons/clock.svg";
import ChevronLeftIcon from "../../../assets/icons/chevron-left.svg";

const SNOOZE_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
];

type Props = {
  medicationName: string;
  time: string;
  isTaken: boolean;
  isSkipped: boolean;
  onTaken: () => void;
  onSkip: () => void;
  onSnooze: (minutes: number) => void;
  onChange?: (index: number) => void;
};

const MedicationActionSheet = forwardRef<BottomSheet, Props>(
  (
    {
      medicationName,
      time,
      isTaken,
      isSkipped,
      onTaken,
      onSkip,
      onSnooze,
      onChange,
    },
    ref,
  ) => {
    const { width } = useWindowDimensions();
    const [view, setView] = useState<"actions" | "snooze">("actions");
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleClose = useCallback(() => {
      (ref as React.RefObject<BottomSheet>).current?.close();
    }, [ref]);

    const handleSheetChange = useCallback((index: number) => {
      if (index === -1) {
        setTimeout(() => {
          setView("actions");
          slideAnim.setValue(0);
        }, 300);
      }
    }, []);

    const goToSnooze = useCallback(() => {
      setView("snooze");
      Animated.spring(slideAnim, {
        toValue: -width,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }, [width]);

    const goBack = useCallback(() => {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start(() => setView("actions"));
    }, []);

    const handleTaken = useCallback(() => {
      onTaken();
      handleClose();
    }, [onTaken, handleClose]);

    const handleSkip = useCallback(() => {
      onSkip();
      handleClose();
    }, [onSkip, handleClose]);

    const handleSnooze = useCallback(
      (minutes: number) => {
        onSnooze(minutes);
        handleClose();
      },
      [onSnooze, handleClose],
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
        onChange={(index) => {
          handleSheetChange(index);
          onChange?.(index);
        }}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.overflow}>
            <Animated.View
              style={[
                styles.slideWrapper,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              {/* ------------------------------- Action View ------------------------------ */}
              <View style={[styles.viewPane, { width }]}>
                <View style={styles.header}>
                  <Text style={styles.medName}>{medicationName}</Text>
                  <Text style={styles.medTime}>{time}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.actions}>
                  {/* ---------------------------------- Taken --------------------------------- */}
                  <Pressable
                    style={[styles.actionRow, isTaken && styles.actionRowTaken]}
                    onPress={handleTaken}
                  >
                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor: (Colors.success || "#22C55E") + "20",
                        },
                      ]}
                    >
                      <CheckIcon
                        width={20}
                        height={20}
                        color={Colors.success || "#22C55E"}
                      />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text style={styles.actionLabel}>
                        {isTaken ? "Mark as not taken" : "Mark as taken"}
                      </Text>
                      <Text style={styles.actionSub}>
                        {isTaken ? "Undo taken status" : "Record this dose"}
                      </Text>
                    </View>
                    {isTaken && (
                      <View style={styles.badge}>
                        <CheckIcon
                          width={16}
                          height={16}
                          stroke={Colors.success}
                        />
                      </View>
                    )}
                  </Pressable>

                  {/* --------------------------------- Skipped -------------------------------- */}
                  <Pressable
                    style={[
                      styles.actionRow,
                      isSkipped && styles.actionRowSkipped,
                    ]}
                    onPress={handleSkip}
                  >
                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor:
                            (Colors.textSecondary || "#6B7280") + "20",
                        },
                      ]}
                    >
                      <SkipIcon
                        width={20}
                        height={20}
                        stroke={Colors.textSecondary || "#6B7280"}
                      />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text style={styles.actionLabel}>
                        {isSkipped ? "Undo skip" : "Skip this dose"}
                      </Text>
                      <Text style={styles.actionSub}>
                        {isSkipped
                          ? "Mark as pending again"
                          : "Intentionally skip"}
                      </Text>
                    </View>
                    {isSkipped && (
                      <View style={styles.badge}>
                        <SkipIcon
                          height={16}
                          width={16}
                          stroke={Colors.textSecondary}
                        />
                      </View>
                    )}
                  </Pressable>

                  {/* --------------------------------- Snooze --------------------------------- */}
                  <Pressable style={styles.actionRow} onPress={goToSnooze}>
                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor: (Colors.warning || "#F59E0B") + "20",
                        },
                      ]}
                    >
                      <ClockIcon
                        width={20}
                        height={20}
                        stroke={Colors.warning || "#F59E0B"}
                      />
                    </View>
                    <View style={styles.actionTexts}>
                      <Text style={styles.actionLabel}>Snooze reminder</Text>
                      <Text style={styles.actionSub}>Remind me later</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </View>

                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>

              {/* ------------------------------- Snooze View ------------------------------ */}
              <View style={[styles.viewPane, { width }]}>
                {/* ------------------------------ Snooze Header ----------------------------- */}
                <View style={styles.snoozeHeader}>
                  <Pressable
                    onPress={goBack}
                    style={styles.backButton}
                    hitSlop={8}
                  >
                    <ChevronLeftIcon
                      width={20}
                      height={20}
                      stroke={Colors.textPrimary}
                    />
                  </Pressable>
                  <View>
                    <Text style={styles.medName}>Snooze reminder</Text>
                    <Text style={styles.medTime}>Remind me again in...</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.snoozeOptions}>
                  {SNOOZE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={styles.snoozeOption}
                      onPress={() => handleSnooze(opt.value)}
                    >
                      <Text style={styles.snoozeLabel}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default MedicationActionSheet;

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.textSecondary + "40",
    width: 40,
  },
  background: {
    backgroundColor: Colors.background,
  },
  container: {
    paddingBottom: 32,
  },
  overflow: {
    overflow: "hidden",
  },
  slideWrapper: {
    flexDirection: "row",
  },
  viewPane: {
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
  },
  medName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  medTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border || "#E5E5E5",
    marginBottom: 8,
  },
  actions: {
    gap: 4,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  actionRowTaken: {
    backgroundColor: (Colors.success || "#22C55E") + "10",
  },
  actionRowSkipped: {
    backgroundColor: (Colors.textSecondary || "#6B7280") + "10",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTexts: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  badge: {
    width: 24,
    height: 24,
    justifyContent: "center",
  },
  chevron: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: Colors.surface,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  snoozeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.subtle || "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  snoozeOptions: {
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  snoozeOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.subtle || "#F5F5F5",
  },
  snoozeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
});
