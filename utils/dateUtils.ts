export const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

export function parseScheduledDateTime(
  dateStr: string,
  timeStr: string,
): Date | null {
  if (!dateStr || !timeStr) return null;
  const dateMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  const timeMatch = timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/);
  if (!dateMatch || !timeMatch) return null;
  const d = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(d.getTime())) return null;
  return d;
}