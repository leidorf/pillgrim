const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withFullscreenActivity(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (!app?.activity) return cfg;

    for (const activity of app.activity) {
      if (activity.$["android:name"] === ".MainActivity") {
        activity.$["android:showWhenLocked"] = "true";
        activity.$["android:turnScreenOn"] = "true";
        break;
      }
    }
    return cfg;
  });
};
