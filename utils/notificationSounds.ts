import { Platform } from "react-native";

export type NotificationSound =
  | "silent"
  | "default"
  | "apoc_sound"
  | "dozer_sound"
  | "mouse_sound"
  | "switch_sound"
  | "tank_sound";

export const SOUND_OPTIONS: { value: NotificationSound; labelKey: string }[] = [
  { value: "silent", labelKey: "sound.silent" },
  { value: "default", labelKey: "sound.default" },
  { value: "apoc_sound", labelKey: "sound.apoc" },
  { value: "dozer_sound", labelKey: "sound.dozer" },
  { value: "mouse_sound", labelKey: "sound.mouse" },
  { value: "switch_sound", labelKey: "sound.switch" },
  { value: "tank_sound", labelKey: "sound.tank" },
];

export function resolveNotificationSound(
  sound: NotificationSound,
): boolean | string | undefined {
  if (sound === "silent") return false;
  if (sound === "default") return undefined;
  return Platform.OS === "ios" ? `${sound}.mp3` : sound;
}
