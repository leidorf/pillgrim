import { DailyScheduleEntry } from "../utils/medicationScheduleUtils";
import { MonthRange } from "../utils/monthRange";
import {
  TimeFmt,
  buildExportFileName,
  formatDateExport,
  formatTimeExport,
} from "../utils/exportFormatting";
import { shareFile, writeTextFile } from "./fileExportService";

const BOM = "﻿";

const escapeCSV = (v: string): string => {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
};

export const buildCSVContent = (params: {
  scheduleMap: Map<string, DailyScheduleEntry[]>;
  timeFormat: TimeFmt;
  t: (key: string) => string;
}): string => {
  const { scheduleMap, timeFormat, t } = params;

  const headers = [
    t("export.date"),
    t("export.medName"),
    t("export.scheduledTime"),
    t("export.dose"),
    t("export.status"),
    t("export.takenAt"),
  ];

  const rows: string[] = [];

  for (const dateStr of [...scheduleMap.keys()].sort()) {
    const entries = scheduleMap.get(dateStr)!;
    for (const e of entries) {
      const statusLabel = t(`logStatus.${e.status}`);
      const takenAtStr =
        e.status === "taken" && e.log?.takenAt
          ? formatDateExport(e.log.takenAt, timeFormat)
          : "";

      rows.push(
        [
          e.scheduledDate,
          e.medication.name,
          formatTimeExport(e.scheduledTime, timeFormat),
          e.dose,
          statusLabel,
          takenAtStr,
        ]
          .map(escapeCSV)
          .join(","),
      );
    }
  }

  return BOM + [headers.map(escapeCSV).join(","), ...rows].join("\n");
};

export const exportCSV = async (params: {
  scheduleMap: Map<string, DailyScheduleEntry[]>;
  range: MonthRange;
  timeFormat: TimeFmt;
  t: (key: string) => string;
}): Promise<void> => {
  const fileName = buildExportFileName(params.range, "csv");
  await writeTextFile({ fileName, content: buildCSVContent(params) });
  await shareFile({ fileName, mimeType: "text/csv" });
};
