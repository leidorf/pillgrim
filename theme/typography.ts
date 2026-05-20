export type FontScale = "small" | "normal" | "large" | "xlarge";

export const FontScaleMultiplier: Record<FontScale, number> = {
  small: 0.85,
  normal: 1.0,
  large: 1.15,
  xlarge: 1.3,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const LineHeight = {
  tight: 1,
  normal: 1.2,
  loose: 1.5,
} as const;