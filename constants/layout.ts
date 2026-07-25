import { Dimensions } from "react-native";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export const TAB_BAR_CONTENT_HEIGHT = Math.min(
  Math.max(Math.round(screenHeight * 0.0576), 48),
  56,
);

export const TAB_BAR_ICON_SIZE = Math.min(
  Math.max(Math.round(screenWidth * 0.061), 20),
  26,
);

export const buildTabBarStyle = (safeAreaBottom: number, hidden?: boolean) =>
  ({
    display: hidden ? "none" : "flex",
    height: TAB_BAR_CONTENT_HEIGHT + safeAreaBottom,
    maxHeight: TAB_BAR_CONTENT_HEIGHT + safeAreaBottom,
    paddingTop: 0,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderTopWidth: 0,
    boxShadow: "none",
    elevation: 0,
  }) as const;
