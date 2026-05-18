import { MedicationLog, LogStatus } from "../types/medication";

export function getMedicationLogStatus(
  log: MedicationLog | undefined,
  scheduledDate: string,
  scheduledTime: string,
): LogStatus {
  if (log?.takenAt && !log.skipped) return "taken";
  if (log?.skipped) return "skipped";

  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  if (scheduledDateTime < new Date()) return "missed";

  return "pending";
}