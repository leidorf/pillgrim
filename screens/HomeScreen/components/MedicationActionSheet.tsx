import { forwardRef, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../../components/Text";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors } from "../../../constants/theme";
import CheckIcon from "../../../assets/icons/circle-check-big.svg";
import SkipIcon from "../../../assets/icons/circle-minus.svg";
import ClockIcon from "../../../assets/icons/clock.svg";
import ChevronLeftIcon from "../../../assets/icons/chevron-left.svg";
import ChevronRightIcon from "../../../assets/icons/chevron-right.svg";

const SNOOZE_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
];

type Props = {
  medicationName: string;
  displayTime: string;
  isTaken: boolean;
  isSkipped: boolean;
  onTaken: () => void;
  onSkip: () => void;
  onSnooze: (minutes: number) => void;
  onAnimate?: (_fromIndex: number, toIndex: number) => void;
};

const MedicationActionSheet = forwardRef<BottomSheet, Props>(
  (
    {
      medicationName,
      displayTime,
      isTaken,
      isSkipped,
      onTaken,
      onSkip,
      onSnooze,
      onAnimate,
    },
    ref,
  ) => {
    const [view, setView] = useState<"actions" | "snooze">("actions");

    const handleClose = useCallback(() => {
      (ref as React.RefObject<BottomSheet>).current?.close();
    }, [ref]);

    const handleSheetAnimate = useCallback(
      (_fromIndex: number, toIndex: number) => {
        if (toIndex === -1) {
          setView("actions");
        }
        onAnimate?.(_fromIndex, toIndex); 
      },
      [onAnimate],
    );

    const goToSnooze = useCallback(() => {
      setView("snooze");
    }, []);

    const goBack = useCallback(() => {
      setView("actions");
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
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        onAnimate={handleSheetAnimate}
      >
        <BottomSheetView style={styles.container}>
          {view === "actions" ? (
            <View style={styles.viewPane}>
              <View style={styles.header}>
                <Text style={styles.medName}>{medicationName}</Text>
                <Text style={styles.medTime}>{displayTime}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.actions}>
                {/* ---------------------------------- Taken --------------------------------- */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.actionRow, isTaken && styles.actionRowTaken]}
                  onPress={handleTaken}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor: Colors.success + "20",
                      },
                    ]}
                  >
                    <CheckIcon width={20} height={20} color={Colors.success} />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionLabel}>
                      {isTaken ? "Mark as not taken" : "Mark as taken"}
                    </Text>
                    <Text style={styles.actionSub}>
                      {isTaken ? "Undo taken status" : "Record this dose"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* --------------------------------- Skipped -------------------------------- */}
                <TouchableOpacity
                  activeOpacity={0.7}
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
                        backgroundColor: Colors.textSecondary + "20",
                      },
                    ]}
                  >
                    <SkipIcon
                      width={20}
                      height={20}
                      stroke={Colors.textSecondary}
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
                </TouchableOpacity>

                {/* --------------------------------- Snooze --------------------------------- */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.actionRow}
                  onPress={goToSnooze}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor: Colors.warning + "20",
                      },
                    ]}
                  >
                    <ClockIcon width={20} height={20} stroke={Colors.warning} />
                  </View>
                  <View style={styles.actionTexts}>
                    <Text style={styles.actionLabel}>Snooze reminder</Text>
                    <Text style={styles.actionSub}>Remind me later</Text>
                  </View>
                  <ChevronRightIcon
                    width={20}
                    height={20}
                    stroke={Colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.viewPane}>
              {/* ------------------------------ Snooze Header ----------------------------- */}
              <View style={styles.snoozeHeader}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={goBack}
                  style={styles.backButton}
                  hitSlop={12}
                >
                  <ChevronLeftIcon
                    width={20}
                    height={20}
                    stroke={Colors.textPrimary}
                  />
                </TouchableOpacity>
                <View>
                  <Text style={styles.medName}>Snooze reminder</Text>
                  <Text style={styles.medTime}>Remind me again in...</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.snoozeOptions}>
                {SNOOZE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    style={styles.snoozeOption}
                    onPress={() => handleSnooze(opt.value)}
                  >
                    <Text style={styles.snoozeLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default MedicationActionSheet;

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: Colors.textSecondary + "40",
    width: 40,
  },
  sheetBackground: {
    backgroundColor: Colors.surfaceElevated,
  },
  container: {
    paddingBottom: 32,
  },
  viewPane: {
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
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
    backgroundColor: Colors.border,
    marginVertical: 8,
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
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  actionRowTaken: {
    backgroundColor: Colors.success + "10",
  },
  actionRowSkipped: {
    backgroundColor: Colors.textSecondary + "10",
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
    fontSize: 32,
    color: Colors.textSecondary,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: Colors.surface,
    marginTop: "auto",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  snoozeHeader: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  backButton: {
    width: 36,
    height: 36,
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
    backgroundColor: Colors.surface,
  },
  snoozeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
});
