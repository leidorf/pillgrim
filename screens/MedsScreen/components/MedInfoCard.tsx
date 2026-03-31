import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Medication } from "../../../types/medication";
import PillIcon from "../../../assets/icons/pill.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import TrashIcon from "../../../assets/icons/trash.svg";
import { Colors } from "../../../constants/theme";
import { MED_FORMS } from "../../../constants/medication-forms";

type MedInfoCardProps = {
  medication: Medication;
  scheduleLabel: string;
  onEdit: () => void;
  onDelete: () => void;
};

const MedInfoCard = ({ medication, onEdit, onDelete }: MedInfoCardProps) => {
  const { name, form, isActive } = medication;

  const handleLongPress = () => {
    Alert.alert(name, "Choose an action", [
      { text: "Cancel", style: "cancel" },
      { text: "Edit", onPress: onEdit },
      { text: "Delete", onPress: onDelete, style: "destructive" },
    ]);
  };

  const getFormIcon = () => {
    const form = MED_FORMS.find((f) => f.id === medication.form);
    return form?.Icon || PillIcon;
  };

  const FormIcon = getFormIcon();

  return (
    <Pressable
      style={[styles.container, !isActive && styles.inactiveContainer]}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <FormIcon height={24} width={24} />
        </View>
        <View>
          <Text style={styles.text} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.note}>{form}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable style={styles.actionButton} onPress={onEdit} hitSlop={8}>
          <EditIcon width={20} height={20} stroke={Colors.primary} />
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onDelete} hitSlop={8}>
          <TrashIcon
            width={20}
            height={20}
            stroke={Colors.error || "#EF4444"}
          />
        </Pressable>
      </View>

      {!isActive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveText}>PAUSED</Text>
        </View>
      )}
    </Pressable>
  );
};

export default MedInfoCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  inactiveContainer: {
    opacity: 0.7,
    backgroundColor: "#f8f8f8",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { fontSize: 20, fontWeight: 500 },
  note: {
    color: "#757575",
    textTransform: "capitalize",
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },
});
