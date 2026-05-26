import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Text } from "../../../../components/Text";
import InlineContainer from "../../components/InlineContainer";
import ArrowDownIcon from "../../../../assets/icons/arrow-down.svg";
import { DropdownModal } from "../../../../components/DropdownModal";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
};

const MONTH_KEYS = [
  "months.january",
  "months.february",
  "months.march",
  "months.april",
  "months.may",
  "months.june",
  "months.july",
  "months.august",
  "months.september",
  "months.october",
  "months.november",
  "months.december",
];

function getMaxDays(month: number, year: number): number {
  if (month === 2) {
    if (year % 4 !== 0) return 28;
    if (year % 100 !== 0) return 29;
    if (year % 400 !== 0) return 28;
    return 29;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

const DateInputFields = ({ value, onChange, label }: Props) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [day, setDay] = useState(
    value ? value.getDate().toString() : today.getDate().toString(),
  );
  const [month, setMonth] = useState(
    value
      ? (value.getMonth() + 1).toString()
      : (today.getMonth() + 1).toString(),
  );
  const [year, setYear] = useState(
    value ? value.getFullYear().toString() : today.getFullYear().toString(),
  );

  const dayRef = useRef(day);
  const monthRef = useRef(month);
  const yearRef = useRef(year);
  useEffect(() => {
    dayRef.current = day;
  }, [day]);
  useEffect(() => {
    monthRef.current = month;
  }, [month]);
  useEffect(() => {
    yearRef.current = year;
  }, [year]);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  useEffect(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      const date = new Date(y, m - 1, d);
      if (date.getMonth() === m - 1 && date.getDate() === d && date >= today) {
        onChange(date);
      }
    }
  }, []);

  const validateAndEmit = useCallback(
    (d: string, m: string, y: string) => {
      const dNum = parseInt(d, 10);
      const mNum = parseInt(m, 10);
      const yNum = parseInt(y, 10);

      if (isNaN(dNum) || isNaN(mNum) || isNaN(yNum)) {
        onChange(null);
        return;
      }
      if (mNum < 1 || mNum > 12 || dNum < 1) {
        onChange(null);
        return;
      }
      const maxDays = getMaxDays(mNum, yNum);
      if (dNum > maxDays) {
        onChange(null);
        return;
      }

      const date = new Date(yNum, mNum - 1, dNum);
      if (
        date.getMonth() !== mNum - 1 ||
        date.getDate() !== dNum ||
        date < today
      ) {
        onChange(null);
        return;
      }

      onChange(date);
    },
    [onChange, today],
  );

  const handleDayChange = useCallback(
    (text: string) => {
      let cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
      if (cleaned.length === 2) {
        let num = parseInt(cleaned, 10);
        const m = parseInt(monthRef.current, 10);
        const y = parseInt(yearRef.current, 10);
        if (!isNaN(m) && !isNaN(y)) {
          const maxDays = getMaxDays(m, y);
          if (num > maxDays) cleaned = maxDays.toString();
        }
        if (num < 1) cleaned = "01";
      }
      dayRef.current = cleaned;
      setDay(cleaned);
      validateAndEmit(cleaned, monthRef.current, yearRef.current);
    },
    [validateAndEmit],
  );

  const handleMonthSelect = useCallback(
    (monthNum: number) => {
      const val = monthNum.toString();
      monthRef.current = val;
      setMonth(val);
      setIsMonthPickerOpen(false);
      validateAndEmit(dayRef.current, val, yearRef.current);
    },
    [validateAndEmit],
  );

  const handleYearChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
      yearRef.current = cleaned;
      setYear(cleaned);
      validateAndEmit(dayRef.current, monthRef.current, cleaned);
    },
    [validateAndEmit],
  );

  const currentMonthIndex = month ? parseInt(month, 10) - 1 : -1;

  const monthOptions = useMemo(
    () =>
      MONTH_KEYS.map((key, index) => ({
        value: index + 1,
        label: t(key),
      })),
    [t],
  );

  return (
    <InlineContainer containerText={label}>
      <View style={styles.row}>
        <View style={styles.fieldWrapper}>
          <TextInput
            style={styles.input}
            value={day}
            onChangeText={handleDayChange}
            placeholder={t("addMedication.dayPlaceholder")}
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
          />
          <Text style={styles.fieldLabel}>{t("addMedication.dayLabel")}</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <Pressable
            style={styles.monthSelector}
            onPress={() => setIsMonthPickerOpen(true)}
          >
            <Text
              style={[
                styles.monthSelectorText,
                !month && styles.monthSelectorPlaceholder,
              ]}
              numberOfLines={1}
            >
              {month ? t(MONTH_KEYS[parseInt(month, 10) - 1]) : t("addMedication.monthPlaceholder")}
            </Text>
            <ArrowDownIcon
              height={14}
              width={14}
              stroke={theme.textSecondary}
            />
          </Pressable>
          <Text style={styles.fieldLabel}>{t("addMedication.monthLabel")}</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <TextInput
            style={[styles.input, styles.inputYear]}
            value={year}
            onChangeText={handleYearChange}
            placeholder={t("addMedication.yearPlaceholder")}
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            selectTextOnFocus
          />
          <Text style={styles.fieldLabel}>{t("addMedication.yearLabel")}</Text>
        </View>
      </View>

      <DropdownModal
        visible={isMonthPickerOpen}
        title={t("addMedication.selectMonth")}
        options={monthOptions}
        selectedValue={parseInt(month, 10)}
        onSelect={handleMonthSelect}
        onClose={() => setIsMonthPickerOpen(false)}
      />
    </InlineContainer>
  );
};

const FIELD_HEIGHT = 52;

const createStyles = (theme: Theme) => StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    paddingVertical: 8,
  },
  fieldWrapper: {
    alignItems: "center",
    gap: 6,
  },
  input: {
    width: 64,
    height: FIELD_HEIGHT,
    borderRadius: 12,
    backgroundColor: theme.surfaceElevated,
    color: theme.textPrimary,
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  inputYear: {
    width: 88,
  },
  fieldLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  monthSelector: {
    width: 132,
    height: FIELD_HEIGHT,
    borderRadius: 12,
    backgroundColor: theme.surfaceElevated,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    gap: 4,
  },
  monthSelectorText: {
    flex: 1,
    color: theme.textPrimary,
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  monthSelectorPlaceholder: {
    color: theme.textMuted,
    fontWeight: "500",
    fontSize: 14,
  },
});

export default DateInputFields;
