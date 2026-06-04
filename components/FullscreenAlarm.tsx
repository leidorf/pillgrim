import { useMemo, useState, useCallback } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Vibration,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Text } from "./Text";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme/useAppTheme";
import { Theme } from "../constants/theme";
import { useMedicationStore } from "../store/medicationStore";
import { useLogStore } from "../store/logsStore";
import { getLocalDateString } from "../utils/dateUtils";
import { snoozeMedicationNotification } from "../services/notificationService";
import PillBottleIcon from "../assets/icons/pill-bottle.svg";
import ChevronDown from "../assets/icons/arrow-down.svg";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SNOOZE_OPTIONS = [
  { labelKey: "snooze.15min", value: 15 },
  { labelKey: "snooze.30min", value: 30 },
  { labelKey: "snooze.1hour", value: 60 },
  { labelKey: "snooze.2hours", value: 120 },
];

export type AlarmData = {
  medicationId: string;
  scheduledTime: string;
  title: string;
  body: string;
};

type Props = {
  data: AlarmData;
  onDismiss: () => void;
};

const FullscreenAlarm = ({ data, onDismiss }: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [actionTaken, setActionTaken] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  const snooze = snoozeOpen ? SNOOZE_OPTIONS : [];

  const startVibration = useCallback(() => {
    Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
  }, []);

  const stopVibration = useCallback(() => {
    Vibration.cancel();
  }, []);

  // Start vibrating when the alarm appears
  useMemo(() => {
    startVibration();
    return stopVibration;
  }, []);

  const dismiss = useCallback(() => {
    stopVibration();
    onDismiss();
  }, [onDismiss, stopVibration]);

  const handleTaken = useCallback(() => {
    stopVibration();
    setActionTaken(true);

    const dateStr = getLocalDateString(new Date());
    const med = useMedicationStore
      .getState()
      .medications.find((m) => m.id === data.medicationId);
    const doseStr = med?.timeDoses?.find(
      (td) => td.time === data.scheduledTime,
    )?.dose;
    const doseAmount = doseStr ? parseInt(doseStr, 10) || undefined : undefined;

    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === data.medicationId &&
        l.scheduledDate === dateStr &&
        l.scheduledTime === data.scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, {
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    } else {
      addLog({
        medicationId: data.medicationId,
        scheduledDate: dateStr,
        scheduledTime: data.scheduledTime,
        takenAt: new Date(),
        skipped: false,
        doseAmount,
      });
    }

    if (doseAmount && doseAmount > 0) {
      useMedicationStore
        .getState()
        .updateStock(data.medicationId, -doseAmount);
    }

    setTimeout(dismiss, 600);
  }, [data, dismiss, stopVibration]);

  const handleSkip = useCallback(() => {
    stopVibration();
    setActionTaken(true);

    const dateStr = getLocalDateString(new Date());
    const { logs, addLog, updateLog } = useLogStore.getState();
    const existing = logs.find(
      (l) =>
        l.medicationId === data.medicationId &&
        l.scheduledDate === dateStr &&
        l.scheduledTime === data.scheduledTime,
    );
    if (existing) {
      updateLog(existing.id, { skipped: true });
    } else {
      addLog({
        medicationId: data.medicationId,
        scheduledDate: dateStr,
        scheduledTime: data.scheduledTime,
        skipped: true,
      });
    }

    setTimeout(dismiss, 600);
  }, [data, dismiss, stopVibration]);

  const handleSnooze = useCallback(
    (minutes: number) => {
      const med = useMedicationStore
        .getState()
        .medications.find((m) => m.id === data.medicationId);
      if (!med) return;
      const doseStr = med.timeDoses?.find(
        (td) => td.time === data.scheduledTime,
      )?.dose;
      snoozeMedicationNotification(
        med,
        data.scheduledTime,
        minutes,
        doseStr,
      );
      stopVibration();
      dismiss();
    },
    [data, dismiss, stopVibration],
  );

  const toggleSnooze = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSnoozeOpen((prev) => !prev);
  }, []);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* ----------------------------- Icon & Text ------------------------------ */}
          <View style={styles.header}>
            <PillBottleIcon
              width={56}
              height={56}
              stroke={theme.primary}
              strokeWidth={1.5}
            />
            <Text style={styles.title}>{data.title}</Text>
            {data.body ? (
              <Text style={styles.body}>{data.body}</Text>
            ) : null}
          </View>

          {/* ------------------------ Skip + Snooze (side by side) ----------------------- */}
          <View style={styles.row}>
            <Pressable
              style={[styles.btnSmall, styles.btnSkip]}
              onPress={handleSkip}
              disabled={actionTaken}
            >
              <Text style={styles.btnSkipText}>
                {t("notifications.actionSkip")}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.btnSmall, styles.btnSnooze, snoozeOpen && styles.btnSnoozeActive]}
              onPress={toggleSnooze}
              disabled={actionTaken}
            >
              <Text style={styles.btnSnoozeText}>
                {t("medicationAction.snooze")}
              </Text>
              <ChevronDown
                width={14}
                height={14}
                stroke={theme.primaryDark}
                style={snoozeOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
              />
            </Pressable>
          </View>

          {/* --------------------------- Snooze options --------------------------- */}
          {snooze && snooze.length > 0 && (
            <View style={styles.snoozeRow}>
              {snooze.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={styles.snoozeChip}
                  onPress={() => handleSnooze(opt.value)}
                >
                  <Text style={styles.snoozeChipText}>
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* -------------------------------- Taken (full width, bottom) -------------------------------- */}
          <Pressable
            style={[styles.btnTaken]}
            onPress={handleTaken}
            disabled={actionTaken}
          >
            <Text style={styles.btnTakenText}>
              {t("notifications.actionTaken")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.surfaceElevated,
      borderRadius: 28,
      paddingVertical: 40,
      paddingHorizontal: 28,
      alignItems: "center",
      elevation: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.textPrimary,
      textAlign: "center",
    },
    body: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    /* ---------------------------- Skip + Snooze row --------------------------- */
    row: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      marginBottom: 16,
    },
    btnSmall: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    btnSkip: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.textSecondary + "25",
    },
    btnSkipText: {
      color: theme.textSecondary,
      fontWeight: "600",
      fontSize: 14,
    },
    btnSnooze: {
      backgroundColor: theme.primary + "12",
      borderWidth: 1,
      borderColor: theme.primary + "25",
    },
    btnSnoozeActive: {
      backgroundColor: theme.primary + "20",
      borderColor: theme.primaryDark,
    },
    btnSnoozeText: {
      color: theme.primaryDark,
      fontWeight: "700",
      fontSize: 14,
    },
    /* ----------------------------- Snooze options ----------------------------- */
    snoozeRow: {
      flexDirection: "row",
      gap: 8,
      width: "100%",
      marginBottom: 16,
    },
    snoozeChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.primary + "10",
      alignItems: "center",
      justifyContent: "center",
    },
    snoozeChipText: {
      color: theme.primaryDark,
      fontWeight: "600",
      fontSize: 12,
    },
    /* -------------------------------- Taken ---------------------------------- */
    btnTaken: {
      width: "100%",
      paddingVertical: 18,
      borderRadius: 16,
      backgroundColor: theme.success,
      alignItems: "center",
      justifyContent: "center",
    },
    btnTakenText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 18,
    },
  });

export default FullscreenAlarm;
