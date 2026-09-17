import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { handleNotificationResponse } from "./notificationService";
import { logger } from "../utils/logger";
import { getErrorMessage } from "../utils/errorUtils";

const NOTIFICATION_RESPONSE_TASK = "pillgrim-notification-response";

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  NOTIFICATION_RESPONSE_TASK,
  async ({ data, error }) => {
    if (error) {
      logger.error("[Notifications] Background task failed:", error.message);
      return;
    }

    if (!data || typeof data !== "object") return;

    if (!("actionIdentifier" in data)) return;

    logger.log("[Notifications] Background response:", data.actionIdentifier);
    await handleNotificationResponse(
      data as Notifications.NotificationResponse,
    );
  },
);

export async function registerNotificationResponseTask(): Promise<void> {
  if (Platform.OS !== "android") return;

  try {
    if (await TaskManager.isTaskRegisteredAsync(NOTIFICATION_RESPONSE_TASK)) {
      return;
    }
    await Notifications.registerTaskAsync(NOTIFICATION_RESPONSE_TASK);
  } catch (err) {
    logger.error(
      "[Notifications] Failed to register background task:",
      getErrorMessage(err),
    );
  }
}
