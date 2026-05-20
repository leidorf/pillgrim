import React, { useMemo } from "react";
import {
  Text as RNText,
  TextProps,
  StyleSheet,
  PixelRatio,
} from "react-native";
import { useSettingsStore } from "../store/settingsStore";
import { FontScaleMultiplier } from "../theme/typography";

const MAX_SYSTEM_SCALE = 1.5;

export const Text = React.forwardRef<RNText, TextProps>(
  ({ style, allowFontScaling: propAllowFontScaling, ...props }, ref) => {
    const appFontScale = useSettingsStore((s) => s.fontScale);
    const appMultiplier = FontScaleMultiplier[appFontScale] ?? 1.0;

    if (propAllowFontScaling === true) {
      return (
        <RNText ref={ref} style={style} allowFontScaling={true} {...props} />
      );
    }

    const systemScale = PixelRatio.getFontScale();
    const clampedSystemScale = Math.min(systemScale, MAX_SYSTEM_SCALE);
    const finalMultiplier = appMultiplier * clampedSystemScale;
    const flattenedStyle = StyleSheet.flatten(style);
    const overrides: any = {};

    if (flattenedStyle) {
      if (typeof flattenedStyle.fontSize === "number") {
        overrides.fontSize = Math.round(
          flattenedStyle.fontSize * finalMultiplier,
        );
      } else {
        overrides.fontSize = Math.round(14 * finalMultiplier);
      }

      if (typeof flattenedStyle.lineHeight === "number") {
        overrides.lineHeight = Math.round(
          flattenedStyle.lineHeight * finalMultiplier,
        );
      }
    } else {
      overrides.fontSize = Math.round(14 * finalMultiplier);
    }

    return (
      <RNText
        ref={ref}
        style={[style, overrides]}
        allowFontScaling={false}
        {...props}
      />
    );
  },
);

Text.displayName = "Text";
export default Text;
