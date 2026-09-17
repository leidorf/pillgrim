export type MonthRef = { year: number; month: number };
export type MonthRange = { from: MonthRef; to: MonthRef };

export const monthIndex = (m: MonthRef) => m.year * 12 + m.month;

export const monthSlug = (m: MonthRef) =>
  `${m.year}-${String(m.month + 1).padStart(2, "0")}`;

export const normalizeMonthRange = (r: MonthRange): MonthRange =>
  monthIndex(r.from) <= monthIndex(r.to) ? r : { from: r.to, to: r.from };

export const enumerateRangeMonths = (r: MonthRange): MonthRef[] => {
  const { from, to } = normalizeMonthRange(r);
  const out: MonthRef[] = [];
  for (let y = from.year, m = from.month; ; ) {
    out.push({ year: y, month: m });
    if (y === to.year && m === to.month) break;
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
};

export const enumerateMonths = (
  anchor: Date,
  before = 60,
  after = 0,
): MonthRef[] =>
  Array.from({ length: before + after + 1 }, (_, i) => {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() + i - before, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

export const getMonthLabel = (m: MonthRef, locale: string): string =>
  new Date(m.year, m.month, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

export const clampMonthToLatest = (m: MonthRef, latest: MonthRef): MonthRef =>
  monthIndex(m) > monthIndex(latest) ? latest : m;

export const monthOptionsFor = (
  months: MonthRef[],
  role: "from" | "to",
  range: MonthRange,
): MonthRef[] =>
  role === "from"
    ? months.filter((m) => monthIndex(m) <= monthIndex(range.to))
    : months.filter((m) => monthIndex(m) >= monthIndex(range.from));
