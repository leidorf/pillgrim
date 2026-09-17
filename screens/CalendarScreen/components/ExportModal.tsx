import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/Text";
import CheckIcon from "../../../assets/icons/check.svg";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";
import {
  MonthRange,
  MonthRef,
  clampMonthToLatest,
  enumerateMonths,
  getMonthLabel,
  monthOptionsFor,
} from "../../../utils/monthRange";
import { ExportKind } from "../../../utils/exportFormatting";

type Props = {
  visible: boolean;
  defaultYear: number;
  defaultMonth: number;
  busy: boolean;
  onExport: (kind: ExportKind, range: MonthRange) => void;
  onClose: () => void;
};

type PickerView = "main" | "from" | "to";

const isSameMonth = (a: MonthRef, b: MonthRef) =>
  a.year === b.year && a.month === b.month;

const ExportModal = ({
  visible,
  defaultYear,
  defaultMonth,
  busy,
  onExport,
  onClose,
}: Props) => {
  const { t, i18n } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const locale = i18n.language?.split("-")[0] ?? "en";
  const months = useMemo(() => enumerateMonths(new Date()), []);

  const initialMonth = useMemo<MonthRef>(
    () =>
      clampMonthToLatest(
        { year: defaultYear, month: defaultMonth },
        months[months.length - 1],
      ),
    [months, defaultYear, defaultMonth],
  );

  const [view, setView] = useState<PickerView>("main");
  const [from, setFrom] = useState<MonthRef>(initialMonth);
  const [to, setTo] = useState<MonthRef>(initialMonth);

  useEffect(() => {
    if (visible) {
      setFrom(initialMonth);
      setTo(initialMonth);
      setView("main");
    }
  }, [visible, initialMonth]);

  useEffect(() => {
    if (busy) setView("main");
  }, [busy]);

  const options = useMemo(
    () => (view === "main" ? months : monthOptionsFor(months, view, { from, to })),
    [view, months, from, to],
  );

  const title =
    view === "from"
      ? t("export.selectFromMonth")
      : view === "to"
        ? t("export.selectToMonth")
        : t("export.title");

  const handleBack = () => {
    if (busy) return;
    if (view === "main") onClose();
    else setView("main");
  };

  const selected = view === "from" ? from : to;
  const setSelected = view === "from" ? setFrom : setTo;

  const renderField = (label: string, value: MonthRef, target: PickerView) => (
    <Pressable
      style={styles.field}
      disabled={busy}
      onPress={() => setView(target)}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{getMonthLabel(value, locale)}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBack}
    >
      <Pressable style={styles.overlay} onPress={handleBack}>
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.separator} />

          {view === "main" ? (
            <>
              {renderField(t("export.fromLabel"), from, "from")}
              {renderField(t("export.toLabel"), to, "to")}

              <View style={styles.buttonContainer}>
                {busy ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.primary} />
                    <Text style={styles.loadingText}>{t("common.loading")}</Text>
                  </View>
                ) : (
                  <>
                    <Pressable
                      style={styles.button}
                      onPress={() => onExport("csv", { from, to })}
                    >
                      <Text style={styles.buttonPrimary}>{t("export.csv")}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.button}
                      onPress={() => onExport("pdf", { from, to })}
                    >
                      <Text style={styles.buttonPrimary}>{t("export.pdf")}</Text>
                    </Pressable>
                    <Pressable style={styles.button} onPress={onClose}>
                      <Text style={styles.buttonText}>{t("export.cancel")}</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </>
          ) : (
            <>
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {options.map((m) => {
                  const isActive = isSameMonth(m, selected);
                  return (
                    <Pressable
                      key={`${m.year}-${m.month}`}
                      style={[styles.item, isActive && styles.itemActive]}
                      onPress={() => {
                        setSelected(m);
                        setView("main");
                      }}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          isActive && styles.itemTextActive,
                        ]}
                      >
                        {getMonthLabel(m, locale)}
                      </Text>
                      {isActive && (
                        <CheckIcon
                          width={16}
                          height={16}
                          stroke={theme.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable style={styles.button} onPress={() => setView("main")}>
                <Text style={styles.buttonText}>{t("common.back")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.surfaceElevated,
      borderRadius: 20,
      width: "100%",
      maxWidth: 320,
      maxHeight: "80%",
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    separator: {
      height: 1,
      backgroundColor: theme.textSecondary + "20",
      marginBottom: 12,
    },
    field: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.textSecondary + "10",
      marginBottom: 8,
    },
    fieldLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    fieldValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    list: {
      maxHeight: 320,
    },
    listContent: { gap: 2 },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    itemActive: {
      backgroundColor: theme.primary + "10",
    },
    itemText: {
      color: theme.textPrimary,
      fontSize: 16,
    },
    itemTextActive: {
      color: theme.primaryDark,
      fontWeight: "600",
    },
    buttonContainer: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.textSecondary + "20",
    },
    button: {
      paddingVertical: 16,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    buttonPrimary: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.primaryDark,
    },
    loadingContainer: {
      paddingVertical: 24,
      alignItems: "center",
      gap: 10,
    },
    loadingText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

export default ExportModal;
