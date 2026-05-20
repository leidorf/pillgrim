import { useMemo } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { FontSize, FontScaleMultiplier } from "../theme/typography";

export function useScaledFont() {
  const fontScale = useSettingsStore((s) => s.fontScale);
  const multiplier = FontScaleMultiplier[fontScale];

  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(FontSize).map(([k, v]) => [
          k,
          Math.round(v * multiplier),
        ]),
      ) as typeof FontSize,
    [multiplier],
  );
}
