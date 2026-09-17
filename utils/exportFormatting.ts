import { MonthRange, monthSlug, normalizeMonthRange } from "./monthRange";
import { parseScheduledDateTime } from "./dateUtils";

export type TimeFmt = "12h" | "24h";
export type ExportKind = "csv" | "pdf";

export const formatTimeExport = (time24: string, tf: TimeFmt): string => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";
  if (tf === "12h") {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatDateExport = (d: Date, tf: TimeFmt): string => {
  if (tf === "12h") {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const calcDelayMinutes = (
  scheduledDate: string,
  scheduledTime: string,
  takenAt?: Date,
): number | null => {
  if (!takenAt) return null;
  const schedDate = parseScheduledDateTime(scheduledDate, scheduledTime);
  if (!schedDate) return null;
  const sched = schedDate.getTime();
  const actual = takenAt.getTime();
  const diffMin = (actual - sched) / 60_000;
  if (diffMin < 30) return null;
  return Math.round(diffMin / 30) * 30;
};

export const formatDelay = (
  delayMin: number,
  t: (key: string) => string,
): string => {
  if (delayMin < 120) {
    const h = delayMin / 60;
    return `+${h}${t("export.delayHour")}`;
  }
  if (delayMin < 2880) {
    return `+${Math.round(delayMin / 60)}${t("export.delayHour")}`;
  }
  if (delayMin < 20160) {
    return `+${Math.round(delayMin / 1440)}${t("export.delayDay")}`;
  }
  if (delayMin < 86400) {
    return `+${Math.round(delayMin / 10080)}${t("export.delayWeek")}`;
  }
  if (delayMin < 1051200) {
    return `+${Math.round(delayMin / 43200)}${t("export.delayMonth")}`;
  }
  return `+${Math.round(delayMin / 525600)}${t("export.delayYear")}`;
};

export const buildExportFileName = (
  range: MonthRange,
  kind: ExportKind,
): string => {
  const { from, to } = normalizeMonthRange(range);
  const stem =
    monthSlug(from) === monthSlug(to)
      ? `medication-log-${monthSlug(from)}`
      : `medication-log-${monthSlug(from)}_to_${monthSlug(to)}`;
  return `${stem}.${kind}`;
};
