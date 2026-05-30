import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { Medication } from "../types/medication";
import {
  DailyScheduleEntry,
  WeekdayMap,
  isMedicationScheduledForDate,
} from "./medicationScheduleUtils";

/* -------------------------------------------------------------------------- */
/*                               Shared Helpers                               */
/* -------------------------------------------------------------------------- */

type TimeFmt = "12h" | "24h";

const formatTimeExport = (time24: string, tf: TimeFmt): string => {
  const [h, m] = time24.split(":").map(Number);
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

const formatDateExport = (d: Date, tf: TimeFmt): string => {
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

/**
 * Round delay to nearest 0.5h (30 min). Returns delay in hours as a number.
 * Returns null if takenAt is missing or delay < 30min.
 */
const calcDelayHours = (
  scheduledDate: string,
  scheduledTime: string,
  takenAt?: Date,
): number | null => {
  if (!takenAt) return null;
  const sched = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
  const actual = takenAt.getTime();
  const diffMin = (actual - sched) / 60_000;
  if (diffMin < 30) return null;
  // Round to nearest 0.5h
  const rounded = Math.round(diffMin / 30) * 30;
  return rounded / 60;
};

const formatDelay = (hours: number, hourUnit: string): string => {
  if (hours === Math.floor(hours)) return `+${hours}${hourUnit}`;
  return `+${hours}${hourUnit}`; // e.g. +0.5h or +1.5h
};

/* -------------------------------------------------------------------------- */
/*                              CSV Export                                    */
/* -------------------------------------------------------------------------- */

export const exportCSV = async (
  scheduleMap: Map<string, DailyScheduleEntry[]>,
  year: number,
  month: number,
  timeFormat: TimeFmt,
  t: (key: string) => string,
) => {
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const headers = [
    t("export.date"),
    t("export.medName"),
    t("export.scheduledTime"),
    t("export.dose"),
    t("export.status"),
    t("export.takenAt"),
  ];

  const escapeCSV = (v: string): string => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const rows: string[] = [];

  // Iterate dates in order
  for (const dateStr of [...scheduleMap.keys()].sort()) {
    if (!dateStr.startsWith(monthPrefix)) continue;
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

  // UTF-8 BOM for Excel compatibility
  const bom = "﻿";
  const csvContent = bom + [headers.map(escapeCSV).join(","), ...rows].join("\n");

  const monthStr = String(month + 1).padStart(2, "0");
  const fileName = `medication-log-${year}-${monthStr}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: "text/csv",
      dialogTitle: fileName,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              PDF Export                                    */
/* -------------------------------------------------------------------------- */

/** Build the grid data used by the PDF table */
type PDFGridRow = {
  medication: Medication;
  timeDose: { time: string; dose: string };
  /** day index → cell data, undefined if not scheduled that day */
  cells: Map<number, PDFCell | undefined>;
};

type PDFCell =
  | { kind: "taken"; delayHours: number | null }
  | { kind: "skipped" }
  | { kind: "missed" };

const buildPDFGrid = (
  scheduleMap: Map<string, DailyScheduleEntry[]>,
  medications: Medication[],
  year: number,
  month: number,
  weekdayMap: WeekdayMap,
): PDFGridRow[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Only medications that have timeDoses and are active
  const activeMeds = medications.filter(
    (m) => m.isActive && m.timeDoses?.length,
  );

  const grid: PDFGridRow[] = [];

  for (const med of activeMeds) {
    for (const td of med.timeDoses!) {
      const cells = new Map<number, PDFCell | undefined>();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (!isMedicationScheduledForDate(med, d, weekdayMap)) {
          cells.set(day, undefined);
          continue;
        }
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEntries = scheduleMap.get(dateStr) ?? [];
        const entry = dayEntries.find(
          (e) =>
            e.medication.id === med.id && e.scheduledTime === td.time,
        );

        if (!entry) {
          cells.set(day, undefined);
        } else if (entry.status === "taken") {
          const delay = calcDelayHours(
            entry.scheduledDate,
            entry.scheduledTime,
            entry.log?.takenAt,
          );
          cells.set(day, { kind: "taken", delayHours: delay });
        } else if (entry.status === "skipped") {
          cells.set(day, { kind: "skipped" });
        } else if (entry.status === "missed") {
          cells.set(day, { kind: "missed" });
        } else {
          // pending — not shown
          cells.set(day, undefined);
        }
      }

      grid.push({
        medication: med,
        timeDose: td,
        cells,
      });
    }
  }

  return grid;
};

// Maps medication id → rowspan (number of time doses)
type MedSpanMap = Map<string, number>;

const buildMedSpanMap = (grid: PDFGridRow[]): MedSpanMap => {
  const map = new Map<string, number>();
  for (const row of grid) map.set(row.medication.id, (map.get(row.medication.id) ?? 0) + 1);
  return map;
};

const generatePDFHtml = (
  grid: PDFGridRow[],
  medSpanMap: MedSpanMap,
  year: number,
  month: number,
  monthLabel: string,
  timeFormat: TimeFmt,
  t: (key: string) => string,
): string => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Determine if we need compact mode (many columns → smaller font)
  const compact = daysInMonth >= 30;

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) =>
    `<th class="day-col">${i + 1}</th>`,
  ).join("");

  // Build table rows
  let tableRows = "";
  let prevMedId = "";

  for (const row of grid) {
    const isFirstOfMed = row.medication.id !== prevMedId;
    const rowspan = medSpanMap.get(row.medication.id) ?? 1;
    prevMedId = row.medication.id;

    tableRows += "<tr>";

    if (isFirstOfMed) {
      tableRows += `<td class="med-name" rowspan="${rowspan}">${row.medication.name}</td>`;
    }
    tableRows += `<td class="time-col">${formatTimeExport(row.timeDose.time, timeFormat)}</td>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = row.cells.get(day);
      if (cell === undefined) {
        tableRows += '<td class="cell-empty"></td>';
      } else if (cell.kind === "taken") {
        if (cell.delayHours !== null) {
          tableRows += `<td class="cell-taken cell-delay">${formatDelay(cell.delayHours, t("export.delayHour"))}</td>`;
        } else {
          tableRows += '<td class="cell-taken"></td>';
        }
      } else if (cell.kind === "skipped") {
        tableRows += '<td class="cell-skipped"></td>';
      } else if (cell.kind === "missed") {
        tableRows += '<td class="cell-missed"></td>';
      }
    }

    tableRows += "</tr>";
  }

  const legendHTML = `
    <div class="legend">
      <div class="legend-items">
        <span class="legend-item"><span class="legend-swatch sw-green"></span> ${t("export.legendTaken")}</span>
        <span class="legend-item"><span class="legend-swatch sw-green-delay"></span> +1${t("export.delayHour")} ${t("export.legendTakenLate")}</span>
        <span class="legend-item"><span class="legend-swatch sw-red"></span> ${t("export.legendMissed")}</span>
        <span class="legend-item"><span class="legend-swatch sw-gray"></span> ${t("export.legendSkipped")}</span>
      </div>
    </div>`;

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, Helvetica, Arial, sans-serif;
            padding: 16px;
            color: #1a1a1a;
            font-size: ${compact ? "10px" : "11px"};
          }
          h2 { text-align: center; margin-bottom: 12px; font-size: 16px; }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            padding: ${compact ? "3px 1px" : "4px 2px"};
            text-align: center;
            vertical-align: middle;
            word-break: break-word;
          }
          th {
            font-weight: 600;
            background: #f0f0f0;
            font-size: ${compact ? "8px" : "9px"};
          }
          .med-name {
            width: 24%;
            text-align: left;
            font-weight: 600;
            font-size: ${compact ? "8.5px" : "10px"};
            padding: ${compact ? "3px 4px" : "4px 6px"};
            background: #fafafa;
            border-right: 2px solid #e0e0e0;
          }
          .time-col {
            width: 12%;
            color: #555;
            font-size: ${compact ? "8px" : "9px"};
            background: #fafafa;
            border-right: 2px solid #e0e0e0;
          }
          .day-col {
            font-size: ${compact ? "7.5px" : "8.5px"};
          }
          .cell-empty {
            /* no fill */
          }
          .cell-taken {
            background: #4caf50;
            border-radius: 4px;
            color: #fff;
            font-weight: 600;
            font-size: ${compact ? "7px" : "8px"};
          }
          .cell-delay {
            font-size: ${compact ? "6.5px" : "7.5px"};
          }
          .cell-skipped {
            background: #bdbdbd;
            border-radius: 4px;
          }
          .cell-missed {
            background: #f44336;
            border-radius: 4px;
            color: #fff;
            font-weight: 600;
            font-size: ${compact ? "7px" : "8px"};
          }
          .legend {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
          }
          .legend-title {
            font-weight: 700;
            font-size: 10px;
            margin-bottom: 6px;
          }
          .legend-items {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 9px;
          }
          .legend-swatch {
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 3px;
          }
          .sw-green { background: #4caf50; }
          .sw-green-delay { background: #4caf50; }
          .sw-red { background: #f44336; }
          .sw-gray { background: #bdbdbd; }
        </style>
      </head>
      <body>
        <h2>${monthLabel}</h2>
        <table>
          <thead>
            <tr>
              <th class="med-name">${t("export.medication")}</th>
              <th class="time-col">${t("export.time")}</th>
              ${dayHeaders}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        ${legendHTML}
      </body>
    </html>`;
};

export const exportPDF = async (
  scheduleMap: Map<string, DailyScheduleEntry[]>,
  medications: Medication[],
  year: number,
  month: number,
  monthLabel: string,
  weekdayMap: WeekdayMap,
  timeFormat: TimeFmt,
  t: (key: string) => string,
) => {
  const grid = buildPDFGrid(
    scheduleMap,
    medications,
    year,
    month,
    weekdayMap,
  );
  const medSpanMap = buildMedSpanMap(grid);
  const html = generatePDFHtml(grid, medSpanMap, year, month, monthLabel, timeFormat, t);

  const { uri } = await Print.printToFileAsync({ html });

  const monthStr = String(month + 1).padStart(2, "0");
  const fileName = `medication-log-${year}-${monthStr}.pdf`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.moveAsync({ from: uri, to: filePath });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: "application/pdf",
      dialogTitle: fileName,
    });
  }
};
