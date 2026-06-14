import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { useTranslation } from "react-i18next";

import { useTimeFormat } from "../../../hooks/useTimeFormat";
import { parseScheduledDateTime } from "../../../utils/dateUtils";

import CheckIcon from "../../../assets/icons/check.svg";
import SkippedIcon from "../../../assets/icons/minus.svg";
import MissedIcon from "../../../assets/icons/close.svg";
import PendingIcon from "../../../assets/icons/circle-dashed.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type MedicationLog = {
  id: string;
  scheduledTime: string;
  medicationName: string;
  doseTaken?: string;
  takenAt?: Date;
  skipped?: boolean;
  scheduledDate: string;
  displayTime: string;
};

type StatusInfo = {
  label: string;
  subtext: string;
  color: string;
  icon: React.ReactNode;
};

type MedicationLogCardProps = {
  log: MedicationLog;
};

const MedicationLogCard = ({ log }: MedicationLogCardProps) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { formatTime } = useTimeFormat();

  const getStatusInfo = (): StatusInfo => {
    const now = new Date();

    if (log.takenAt) {
      return {
        icon: <CheckIcon width={16} height={16} stroke={theme.primary} />,
        label: t("logStatus.taken"),
        color: theme.success,
        subtext: formatTime(log.takenAt),
      };
    }

    if (log.skipped) {
      return {
        icon: (
          <SkippedIcon width={16} height={16} stroke={theme.textPrimary} />
        ),
        label: t("logStatus.skipped"),
        color: theme.textSecondary,
        subtext: t("logStatus.intentionallySkipped"),
      };
    }

    const scheduledDateTime = parseScheduledDateTime(
      log.scheduledDate,
      log.scheduledTime,
    );

    if (scheduledDateTime !== null && scheduledDateTime < now) {
      return {
        icon: <MissedIcon width={16} height={16} stroke={theme.error} />,
        label: t("logStatus.missed"),
        color: theme.error,
        subtext: t("logStatus.notTakenInTime"),
      };
    }

    return {
      icon: <PendingIcon width={16} height={16} stroke={theme.textPrimary} />,
      label: t("logStatus.pending"),
      color: theme.textSecondary,
      subtext: t("logStatus.notTimeYet"),
    };
  };

  const status = getStatusInfo();

  return (
    <View style={styles.logItem}>
      <View style={styles.logLeft}>
        <Text style={styles.logTime}>{log.displayTime}</Text>
        <View style={styles.timeline} />
      </View>

      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <View>
            <Text style={styles.medicationName}>{log.medicationName}</Text>
            {log.doseTaken && (
              <Text style={styles.doseText}>{log.doseTaken}</Text>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.color + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon}
            </Text>
          </View>
        </View>

        <Text style={styles.statusLabel}>
          {status.label} • {status.subtext}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  logItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  logLeft: {
    width: 50,
    alignItems: "center",
  },
  logTime: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.textSecondary,
    marginBottom: 4,
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: theme.surfaceElevated,
    borderRadius: 1,
  },
  logContent: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.textPrimary,
  },
  doseText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
});

export default MedicationLogCard;
