import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../../../constants/theme";
import { useTimeFormat } from "../../../../hooks/useTimeFormat";

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);
const DECELERATION = 0.94;

type Props = {
  visible: boolean;
  value: Date;
  is24Hour?: boolean;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

const buildHours = (is24Hour: boolean) =>
  is24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

const buildMinutes = () => Array.from({ length: 60 }, (_, i) => i);

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type ColumnProps = {
  items: number[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem?: (n: number) => string;
};

const Column = ({
  items,
  selectedIndex,
  onSelect,
  formatItem = pad,
}: ColumnProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const isMomentumActive = useRef(false);
  const committedIndex = useRef(selectedIndex);

  useEffect(() => {
    committedIndex.current = selectedIndex;
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  const snapToNearest = useCallback(
    (offsetY: number) => {
      const idx = clamp(Math.round(offsetY / ITEM_HEIGHT), 0, items.length - 1);
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
      if (idx !== committedIndex.current) {
        committedIndex.current = idx;
        onSelect(idx);
      }
    },
    [items.length, onSelect],
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isMomentumActive.current = false;
      snapToNearest(e.nativeEvent.contentOffset.y);
    },
    [snapToNearest],
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      setTimeout(() => {
        if (!isMomentumActive.current) snapToNearest(offsetY);
      }, 80);
    },
    [snapToNearest],
  );

  return (
    <View style={styles.column}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate={DECELERATION}
        contentContainerStyle={{
          paddingTop: CENTER_INDEX * ITEM_HEIGHT,
          paddingBottom: CENTER_INDEX * ITEM_HEIGHT,
        }}
        onMomentumScrollBegin={() => {
          isMomentumActive.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      >
        {items.map((value, idx) => {
          const distance = Math.abs(idx - selectedIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.42 : 0.16;
          const scale = distance === 0 ? 1 : distance === 1 ? 0.86 : 0.74;

          return (
            <Pressable
              key={value}
              style={styles.item}
              onPress={() => {
                committedIndex.current = idx;
                onSelect(idx);
                scrollRef.current?.scrollTo({
                  y: idx * ITEM_HEIGHT,
                  animated: true,
                });
              }}
            >
              <Text
                style={[
                  styles.itemText,
                  idx === selectedIndex && styles.itemTextSelected,
                  { opacity, transform: [{ scale }] },
                ]}
              >
                {formatItem(value)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

/* ----------------------------- Main Component ----------------------------- */
export const TimePickerModal = ({
  visible,
  value,
  onConfirm,
  onDismiss,
}: Props) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const is24Hour = useTimeFormat().timeFormat === "24h";

  const hours = buildHours(is24Hour);
  const minutes = buildMinutes();
  const ampmItems = [0, 1];

  const toHourIndex = (date: Date) => {
    if (is24Hour) return date.getHours();
    const h12 = date.getHours() % 12 || 12;
    return h12 - 1;
  };

  const [hourIndex, setHourIndex] = useState(() => toHourIndex(value));
  const [minuteIndex, setMinuteIndex] = useState(() => value.getMinutes());
  const [ampm, setAmpm] = useState<"AM" | "PM">(() =>
    value.getHours() < 12 ? "AM" : "PM",
  );

  useEffect(() => {
    if (visible) {
      setHourIndex(toHourIndex(value));
      setMinuteIndex(value.getMinutes());
      setAmpm(value.getHours() < 12 ? "AM" : "PM");
    }
  }, [visible, value]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    const result = new Date(value);
    const hour = hours[hourIndex];

    if (is24Hour) {
      result.setHours(hour, minuteIndex, 0, 0);
    } else {
      let h24 = hour % 12;
      if (ampm === "PM") h24 += 12;
      result.setHours(h24, minuteIndex, 0, 0);
    }

    onConfirm(result);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [360, 0],
  });

  const ampmIndex = ampm === "AM" ? 0 : 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* -------------------------------- Backdrop -------------------------------- */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* ------------------------------ Bottom Sheet ------------------------------ */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable onPress={onDismiss} hitSlop={12}>
            <Text style={styles.headerAction}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Set Time</Text>
          <Pressable onPress={handleConfirm} hitSlop={12}>
            <Text style={[styles.headerAction, styles.headerConfirm]}>
              Done
            </Text>
          </Pressable>
        </View>

        {/* ------------------------------- Picker Area ------------------------------ */}
        <View style={styles.pickerArea}>
          <View pointerEvents="none" style={styles.selectionBar} />
          <Column
            items={hours}
            selectedIndex={hourIndex}
            onSelect={setHourIndex}
            formatItem={is24Hour ? pad : String}
          />
          <Text style={styles.colon}>:</Text>
          <Column
            items={minutes}
            selectedIndex={minuteIndex}
            onSelect={setMinuteIndex}
            formatItem={pad}
          />
          {!is24Hour && (
            <View style={styles.ampmColumnWrapper}>
              <Column
                items={ampmItems}
                selectedIndex={ampmIndex}
                onSelect={(idx) => setAmpm(idx === 0 ? "AM" : "PM")}
                formatItem={(val) => (val === 0 ? "AM" : "PM")}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    overflow: "hidden",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary + "40",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.textSecondary + "25",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  headerAction: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  headerConfirm: {
    color: Colors.primary,
    fontWeight: "700",
  },
  pickerArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_HEIGHT,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  selectionBar: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "50%",
    marginTop: -(ITEM_HEIGHT / 2),
    height: ITEM_HEIGHT,
    backgroundColor: Colors.primary + "14",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary + "30",
  },
  column: {
    width: 72,
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  ampmColumnWrapper: {
    width: 64,
    height: PICKER_HEIGHT,
    marginLeft: 8,
    overflow: "hidden",
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 28,
    fontWeight: "300",
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  itemTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },
  colon: {
    fontSize: 28,
    fontWeight: "300",
    color: Colors.textSecondary,
    marginHorizontal: 4,
    marginBottom: 4,
  },
});
