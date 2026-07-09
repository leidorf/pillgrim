import { useSettingsStore } from "../store/settingsStore";

export function useTimeFormat() {
  const timeFormat = useSettingsStore((s) => s.timeFormat);

  function formatTime(date: Date): string {
    if (timeFormat === "12h") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  function formatTimeString(time: string): string {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return time;
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return formatTime(date);
  }

  return { formatTime, formatTimeString, timeFormat };
}
