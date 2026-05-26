import { useMemo, forwardRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Medication } from "../../../types/medication";
import PillIcon from "../../../assets/icons/pill.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import TrashIcon from "../../../assets/icons/trash.svg";
import PauseIcon from "../../../assets/icons/pause.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import { MED_FORMS } from "../../../constants/medication-forms";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

type Props = {
  medication: Medication | null;
  scheduleLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onAnimate?: (fromIndex: number, toIndex: number) => void;
};

const MedicationBottomSheet = forwardRef<BottomSheet, Props>(
  (
    { medication, scheduleLabel, onEdit, onDelete, onToggleActive, onAnimate },
    ref,
  ) => {
    const { t } = useTranslation();
    const { name, form, isActive, stock, note } = medication || {};
    const formLabel = form ? t(`medicationForms.${form}` as any) : "";

    const handleClose = () => {
      (ref as React.RefObject<BottomSheet>).current?.close();
    };

    const handleToggleActive = () => {
      if (!medication?.id) return;
      onToggleActive?.(medication.id, !isActive);
      handleClose();
    };

    const getFormIcon = useCallback(() => {
      const formData = MED_FORMS.find((f) => f.id === form);
      return formData?.Icon || PillIcon;
    }, [form]);

    const FormIcon = getFormIcon();

    const formatNote = useCallback(() => {
      if (!note) return "";
      const noteMap: Record<string, string> = {
        before_meal: t("instructions.beforeMeal"),
        with_meal: t("instructions.withMeal"),
        after_meal: t("instructions.afterMeal"),
        empty_stomach: t("instructions.emptyStomach"),
        any: "",
      };
      return noteMap[note] || note;
    }, [note, t]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    const theme = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        onAnimate={onAnimate}
      >
        <BottomSheetView style={styles.contentContainer}>
          {medication && (
            <>
              <View style={styles.summarySection}>
                <View style={styles.summaryIcon}>
                  <FormIcon height={32} width={32} stroke={theme.primary} />
                </View>
                <Text style={styles.summaryName}>{name}</Text>
                <Text style={styles.summaryDetails}>
                  {formLabel} • {scheduleLabel}
                </Text>

                {stock !== undefined && stock > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {t("medication.stock")}:
                    </Text>
                    <Text style={styles.detailValue}>
                      {stock} {t("medication.units")}
                    </Text>
                  </View>
                )}

                {formatNote() && (
                  <View style={styles.noteBadge}>
                    <Text style={styles.noteBadgeText}>{formatNote()}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionsSection}>
                <ActionButton
                  icon={
                    <EditIcon width={20} height={20} stroke={theme.primary} />
                  }
                  label={t("medicationSheet.edit")}
                  color={theme.primary + "15"}
                  onPress={() => {
                    handleClose();
                    onEdit();
                  }}
                />

                <ActionButton
                  icon={
                    isActive ? (
                      <PauseIcon
                        width={20}
                        height={20}
                        stroke={theme.warning}
                      />
                    ) : (
                      <PlayIcon width={20} height={20} stroke={theme.primary} />
                    )
                  }
                  label={
                    isActive
                      ? t("medicationSheet.pause")
                      : t("medicationSheet.resume")
                  }
                  color={isActive ? theme.warningLight : theme.primary + "15"}
                  onPress={handleToggleActive}
                />

                <ActionButton
                  icon={
                    <TrashIcon width={20} height={20} stroke={theme.error} />
                  }
                  label={t("medicationSheet.delete")}
                  color={theme.errorLight}
                  textColor={theme.error}
                  onPress={() => {
                    handleClose();
                    onDelete();
                  }}
                />
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const ActionButton = ({
  icon,
  label,
  color,
  textColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  textColor?: string;
  onPress: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text
        style={[styles.actionText, { color: textColor || theme.textPrimary }]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    handleIndicator: {
      backgroundColor: theme.textSecondary + "40",
      width: 40,
    },
    sheetBackground: {
      backgroundColor: theme.surfaceElevated,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 32,
    },
    summarySection: {
      alignItems: "center",
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.textSecondary + "20",
    },
    summaryIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: theme.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    summaryName: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    summaryDetails: {
      fontSize: 14,
      color: theme.textSecondary,
      textTransform: "capitalize",
    },
    detailRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    detailLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    detailValue: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    noteBadge: {
      marginTop: 12,
      backgroundColor: theme.primary + "15",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    noteBadgeText: {
      fontSize: 12,
      color: theme.primaryDark,
      fontWeight: "500",
    },
    actionsSection: {
      paddingTop: 16,
      gap: 8,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    actionText: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
    },
  });

export default MedicationBottomSheet;
