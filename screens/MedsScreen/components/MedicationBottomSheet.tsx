import { forwardRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { Pressable } from "react-native";
import { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Medication } from "../../../types/medication";
import PillIcon from "../../../assets/icons/pill.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import TrashIcon from "../../../assets/icons/trash.svg";
import PauseIcon from "../../../assets/icons/pause.svg";
import PlayIcon from "../../../assets/icons/play.svg";
import { Colors } from "../../../constants/theme";
import { MED_FORMS } from "../../../constants/medication-forms";
import BottomSheet from "@gorhom/bottom-sheet";

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
    const { name, form, isActive, stock, note } = medication || {};

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
        before_meal: "Before meal",
        with_meal: "With meal",
        after_meal: "After meal",
        empty_stomach: "Empty stomach",
        any: "",
      };
      return noteMap[note] || note;
    }, [note]);

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
                  <FormIcon height={32} width={32} stroke={Colors.primary} />
                </View>
                <Text style={styles.summaryName}>{name}</Text>
                <Text style={styles.summaryDetails}>
                  {form} • {scheduleLabel}
                </Text>

                {stock !== undefined && stock > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock:</Text>
                    <Text style={styles.detailValue}>{stock} units</Text>
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
                    <EditIcon width={20} height={20} stroke={Colors.primary} />
                  }
                  label="Edit Medication"
                  color={Colors.primary + "15"}
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
                        stroke={Colors.warning}
                      />
                    ) : (
                      <PlayIcon
                        width={20}
                        height={20}
                        stroke={Colors.primary}
                      />
                    )
                  }
                  label={isActive ? "Pause Reminders" : "Resume Reminders"}
                  color={isActive ? Colors.warningLight : Colors.primary + "15"}
                  onPress={handleToggleActive}
                />

                <ActionButton
                  icon={
                    <TrashIcon width={20} height={20} stroke={Colors.error} />
                  }
                  label="Delete Medication"
                  color={Colors.errorLight}
                  textColor={Colors.error}
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
  textColor = Colors.textPrimary,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  textColor?: string;
  onPress: () => void;
}) => (
  <Pressable style={styles.actionRow} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color }]}>{icon}</View>
    <Text style={[styles.actionText, { color: textColor }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: Colors.textSecondary + "40",
    width: 40,
  },
  sheetBackground: {
    backgroundColor: Colors.surfaceElevated,
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
    borderBottomColor: Colors.textSecondary + "20",
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  noteBadge: {
    marginTop: 12,
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  noteBadgeText: {
    fontSize: 12,
    color: Colors.primaryDark,
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
