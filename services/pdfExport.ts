import { Medication } from "../types/medication";
import {
  DailyScheduleEntry,
  WeekdayMap,
  isMedicationScheduledForDate,
} from "../utils/medicationScheduleUtils";
import {
  MonthRange,
  MonthRef,
  enumerateRangeMonths,
  getMonthLabel,
} from "../utils/monthRange";
import {
  TimeFmt,
  buildExportFileName,
  calcDelayMinutes,
  formatDelay,
  formatTimeExport,
} from "../utils/exportFormatting";
import { renderHtmlToPdf, shareFile } from "./fileExportService";

/* ------------------------------- PDF Export ------------------------------- */
type PDFGridRow = {
  medication: Medication;
  timeDose: { time: string; dose: string };
  cells: Map<number, PDFCell | undefined>;
};

type PDFCell =
  | { kind: "taken"; delayMinutes: number | null }
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

  /* ----------- Only medications that have timeDoses and are active ---------- */
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
          (e) => e.medication.id === med.id && e.scheduledTime === td.time,
        );

        if (!entry) {
          cells.set(day, undefined);
        } else if (entry.status === "taken") {
          const isPrn = med.schedule?.type === "prn";
          const delay = isPrn
            ? null
            : calcDelayMinutes(
                entry.scheduledDate,
                entry.scheduledTime,
                entry.log?.takenAt,
              );
          cells.set(day, { kind: "taken", delayMinutes: delay });
        } else if (entry.status === "skipped") {
          cells.set(day, { kind: "skipped" });
        } else if (entry.status === "missed") {
          cells.set(day, { kind: "missed" });
        } else {
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

type MedSpanMap = Map<string, number>;

const buildMedSpanMap = (grid: PDFGridRow[]): MedSpanMap => {
  const map = new Map<string, number>();
  for (const row of grid)
    map.set(row.medication.id, (map.get(row.medication.id) ?? 0) + 1);
  return map;
};

const fontScaleCss = (sel: string, compact: boolean): string => `
  ${sel} { font-size: ${compact ? "10px" : "11px"}; }
  ${sel} th, ${sel} td { padding: ${compact ? "3px 1px" : "4px 2px"}; height: ${compact ? "20px" : "24px"}; }
  ${sel} th { font-size: ${compact ? "8px" : "9px"}; }
  ${sel} .med-name { font-size: ${compact ? "8.5px" : "10px"}; padding: ${compact ? "3px 4px" : "4px 6px"}; }
  ${sel} .time-col { font-size: ${compact ? "8px" : "9px"}; }
  ${sel} .day-col { font-size: ${compact ? "7.5px" : "8.5px"}; }
  ${sel} .cell-taken { font-size: ${compact ? "7px" : "8px"}; }
  ${sel} .cell-delay { font-size: ${compact ? "6.5px" : "7.5px"}; }
  ${sel} .cell-missed { font-size: ${compact ? "7px" : "8px"}; }
`;

const generatePDFStyles = (): string => `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, Helvetica, Arial, sans-serif;
    padding: 16px;
    color: #1a1a1a;
  }
  h2 { text-align: center; margin-bottom: 12px; font-size: 16px; }
  .month-section + .month-section {
    break-before: page;
    page-break-before: always;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th, td {
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
  }
  th {
    font-weight: 600;
    background: #f0f0f0;
  }
  .med-name {
    width: 10%;
    text-align: left;
    font-weight: 600;
    background: #fafafa;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }
  .time-col {
    width: 8%;
    font-weight: 600;
    background: #fafafa;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }
  .cell-empty {
    background: transparent;
    border-radius: 4px;
  }
  .cell-taken {
    background: #2E7D32;
    border-radius: 4px;
    color: #fff;
    font-weight: 600;
  }
  .cell-delay {
    background: #2E7D32;
    border-radius: 4px;
    color: #fff;
    font-weight: 600;
  }
  .cell-skipped {
    background: #bdbdbd;
    border-radius: 4px;
  }
  .cell-missed {
    background: #C62828;
    border-radius: 4px;
    color: #fff;
    font-weight: 600;
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
  .sw-green { background: #2E7D32; }
  .sw-green-delay { background: #2E7D32; }
  .sw-red { background: #C62828; }
  .sw-gray { background: #bdbdbd; }
  ${fontScaleCss(".month-section.is-compact", true)}
  ${fontScaleCss(".month-section.is-roomy", false)}
`;

const generatePDFLegend = (t: (key: string) => string): string => `
    <div class="legend">
      <div class="legend-items">
        <span class="legend-item"><span class="legend-swatch sw-green"></span> ${t("export.legendTaken")}</span>
        <span class="legend-item"><span class="legend-swatch sw-green-delay"></span> +1${t("export.delayHour")} ${t("export.legendTakenLate")}</span>
        <span class="legend-item"><span class="legend-swatch sw-red"></span> ${t("export.legendMissed")}</span>
        <span class="legend-item"><span class="legend-swatch sw-gray"></span> ${t("export.legendSkipped")}</span>
      </div>
    </div>`;

const generatePDFDocument = (
  styles: string,
  sections: string,
  legend: string,
): string => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${styles}</style>
      </head>
      <body>
        ${sections}
        ${legend}
      </body>
    </html>`;

const generatePDFMonthSection = (
  grid: PDFGridRow[],
  medSpanMap: MedSpanMap,
  month: MonthRef,
  locale: string,
  timeFormat: TimeFmt,
  t: (key: string) => string,
): string => {
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();

  const compact = daysInMonth >= 30;

  const dayHeaders = Array.from(
    { length: daysInMonth },
    (_, i) => `<th class="day-col">${i + 1}</th>`,
  ).join("");

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
        tableRows += '<td class="cell-empty">&nbsp;</td>';
      } else if (cell.kind === "taken") {
        if (cell.delayMinutes !== null) {
          tableRows += `<td class="cell-taken cell-delay">${formatDelay(cell.delayMinutes, t)}</td>`;
        } else {
          tableRows += '<td class="cell-taken">&nbsp;</td>';
        }
      } else if (cell.kind === "skipped") {
        tableRows += '<td class="cell-skipped">&nbsp;</td>';
      } else if (cell.kind === "missed") {
        tableRows += '<td class="cell-missed"></td>';
      }
    }

    tableRows += "</tr>";
  }

  return `
    <div class="month-section ${compact ? "is-compact" : "is-roomy"}">
      <h2>${getMonthLabel(month, locale)}</h2>
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
    </div>`;
};

export const buildPDFDocument = async (params: {
  scheduleMap: Map<string, DailyScheduleEntry[]>;
  medications: Medication[];
  months: MonthRef[];
  weekdayMap: WeekdayMap;
  timeFormat: TimeFmt;
  t: (key: string) => string;
  locale: string;
}): Promise<string> => {
  const { scheduleMap, medications, months, weekdayMap, timeFormat, t, locale } =
    params;

  const sections: string[] = [];

  for (const month of months) {
    const grid = buildPDFGrid(
      scheduleMap,
      medications,
      month.year,
      month.month,
      weekdayMap,
    );
    sections.push(
      generatePDFMonthSection(
        grid,
        buildMedSpanMap(grid),
        month,
        locale,
        timeFormat,
        t,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return generatePDFDocument(
    generatePDFStyles(),
    sections.join(""),
    generatePDFLegend(t),
  );
};

export const exportPDF = async (params: {
  scheduleMap: Map<string, DailyScheduleEntry[]>;
  medications: Medication[];
  range: MonthRange;
  weekdayMap: WeekdayMap;
  timeFormat: TimeFmt;
  t: (key: string) => string;
  locale: string;
}): Promise<void> => {
  const { scheduleMap, medications, range, weekdayMap, timeFormat, t, locale } =
    params;

  const fileName = buildExportFileName(range, "pdf");
  const html = await buildPDFDocument({
    scheduleMap,
    medications,
    months: enumerateRangeMonths(range),
    weekdayMap,
    timeFormat,
    t,
    locale,
  });

  await renderHtmlToPdf({ fileName, html });
  await shareFile({ fileName, mimeType: "application/pdf" });
};
