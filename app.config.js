const { withAndroidManifest } = require("@expo/config-plugins");

const REMOVE_PERMISSIONS = [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.INTERNET",
];

const withCleanPermissions = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (manifest["uses-permission"]) {
      manifest["uses-permission"] = manifest["uses-permission"].filter(
        (p) => !REMOVE_PERMISSIONS.includes(p.$["android:name"]),
      );
    }

    return config;
  });

module.exports = ({ config }) => {
  config.android = {
    ...config.android,
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.USE_EXACT_ALARM",
      "android.permission.VIBRATE",
      "android.permission.WAKE_LOCK",
      "android.permission.RECEIVE_BOOT_COMPLETED",
    ],
  };

  const buildPropsPlugin = config.plugins?.find(
    (p) => Array.isArray(p) && p[0] === "expo-build-properties",
  );
  if (buildPropsPlugin && Array.isArray(buildPropsPlugin)) {
    buildPropsPlugin[1] = {
      ...buildPropsPlugin[1],
      android: {
        ...buildPropsPlugin[1]?.android,
        enableProguardInReleaseBuilds: true,
        enableShrinkResourcesInReleaseBuilds: true,
      },
    };
  }

  return withCleanPermissions(config);
};
