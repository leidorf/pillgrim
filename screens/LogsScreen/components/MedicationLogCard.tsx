import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../constants/theme";

type MedicationLog = {
  id: string;
  scheduledTime: string;
  medicationName: string;
  doseTaken?: string;
  takenAt?: Date;
  skipped?: boolean;
  scheduledDate: string;
};

type StatusInfo = {
  label: string;
  subtext: string;
  color: string;
  icon: string;
};

type MedicationLogCardProps = {
  log: MedicationLog;
};

const MedicationLogCard = ({ log }: MedicationLogCardProps) => {
  const getStatusInfo = (): StatusInfo => {
    const now = new Date();

    if (log.takenAt) {
      return {
        icon: "✓",
        label: "Taken",
        color: Colors.success || "#22C55E",
        subtext: `${log.takenAt.getHours().toString().padStart(2, "0")}:${log.takenAt.getMinutes().toString().padStart(2, "0")}`,
      };
    }

    if (log.skipped) {
      return {
        icon: "−",
        label: "Skipped",
        color: Colors.textSecondary,
        subtext: "Intentionally skipped",
      };
    }

    const scheduledDateTime = new Date(
      `${log.scheduledDate}T${log.scheduledTime}`,
    );

    if (scheduledDateTime < now) {
      return {
        icon: "✗",
        label: "Missed",
        color: Colors.error || "#EF4444",
        subtext: "Not taken in time",
      };
    }

    return {
      icon: "○",
      label: "Pending",
      color: Colors.textSecondary,
      subtext: "It's not time yet",
    };
  };

  const status = getStatusInfo();

  return (
    <View style={styles.logItem}>
      <View style={styles.logLeft}>
        <Text style={styles.logTime}>{log.scheduledTime}</Text>
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

const styles = StyleSheet.create({
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timeline: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border || "#E5E5E5",
    borderRadius: 1,
  },
  logContent: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
  },
  doseText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default MedicationLogCard;
