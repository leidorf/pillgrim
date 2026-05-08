import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  Image,
  Switch,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import ImageIcon from "../../assets/icons/image.svg";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import BellIcon from "../../assets/icons/bell.svg";
import EyeOffIcon from "../../assets/icons/eye-off.svg";
import PackageIcon from "../../assets/icons/package.svg";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "./components/NextButton";
import { useState, useRef, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InlineContainer from "./components/InlineContainer";
import AddMedicationHeader from "./components/AddMedicationHeader";
import BaseModal from "../../components/BaseModal";

const INSTRUCTION_OPTIONS = [
  { id: "before_meal", label: "Before meal" },
  { id: "with_meal", label: "With meal" },
  { id: "after_meal", label: "After meal" },
  { id: "empty_stomach", label: "Empty stomach" },
  { id: "any", label: "Doesn't matter" },
  { id: "other", label: "Other (specify)" },
] as const;

type InstructionOption = (typeof INSTRUCTION_OPTIONS)[number]["id"];

type NotificationSettings = {
  enabled: boolean;
  hideName: boolean;
  lowStockAlert: boolean;
};

const Step4Screen = () => {
  const route = useRoute<any>();
  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;

  const navigation = useNavigation<NavProp>();
  const { draft, setDraft, saveMedication, updateMedication, clearDraft } =
    useMedicationStore();

  const [selectedInstruction, setSelectedInstruction] =
    useState<InstructionOption | null>(() => {
      if (!draft.note) return null;
      const match = INSTRUCTION_OPTIONS.find((o) => o.id === draft.note);
      return match ? match.id : "other";
    });
  const [customInstruction, setCustomInstruction] = useState(
    selectedInstruction === "other" ? (draft.note ?? "") : "",
  );
  const [stock, setStock] = useState<string>(draft.stock?.toString() || "");
  const [photoUri, setPhotoUri] = useState<string | null>(
    draft.photoUri || null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>(
    draft.notificationSettings ?? {
      enabled: true,
      hideName: false,
      lowStockAlert: true,
    },
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [removePhotoModal, setRemovePhotoModal] = useState(false);
  const stockInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isDropdownOpen) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!notifications.enabled && notifications.hideName) {
      setNotifications((prev) => ({ ...prev, hideName: false }));
    }
  }, [notifications.enabled]);

  useEffect(() => {
    const stockNum = parseInt(stock, 10);
    if (stockNum > 0 && !notifications.lowStockAlert) {
      setNotifications((prev) => ({ ...prev, lowStockAlert: true }));
    }
  }, [stock]);

  const handleSelectOption = (id: InstructionOption) => {
    setSelectedInstruction(id);
    setIsDropdownOpen(false);
    if (id !== "other") {
      setCustomInstruction("");
    }
  };

  const getSelectedLabel = () => {
    if (!selectedInstruction) return "Select instruction...";
    const option = INSTRUCTION_OPTIONS.find(
      (o) => o.id === selectedInstruction,
    );
    return option?.label || "Select instruction...";
  };

  const handleStockChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setStock(numeric);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access photos",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access camera",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImageOptions = () => {
    setImageModalVisible(true);
  };

  const showRemovePhotoOptions = () => {
    setRemovePhotoModal(true);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let finalNote: string | undefined;
      if (selectedInstruction && selectedInstruction !== "any") {
        finalNote =
          selectedInstruction === "other"
            ? customInstruction
            : selectedInstruction;
      }

      const updates: Partial<typeof draft> = {
        ...(finalNote && { note: finalNote as any }),
        ...(stock && { stock: parseInt(stock, 10) }),
        ...(photoUri && { photoUri }),
        isActive: true,
        updatedAt: new Date().toISOString(),
        notificationSettings: notifications,
      };

      setDraft(updates);

      setTimeout(() => {
        if (mode === "edit" && medicationId) {
          updateMedication(medicationId, { ...draft, ...updates });
          clearDraft();
        } else {
          saveMedication();
        }
        navigation.getParent()?.goBack();
      }, 100);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = () => {
    if (selectedInstruction === "other" && !customInstruction.trim()) {
      return false;
    }
    return true;
  };

  const hasStock = parseInt(stock, 10) > 0;

  const handleClose = () => {
    if (mode !== "edit") {
      clearDraft();
    }
    navigation.getParent()?.goBack();
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={() => handleClose()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <AddMedicationHeader currentStep={4} title="Optional Details" />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* --------------------------- Instruction Options -------------------------- */}
          <InlineContainer containerText="Instructions">
            <Pressable
              style={styles.dropdownTrigger}
              onPress={() => setIsDropdownOpen(true)}
            >
              <Text
                style={[
                  styles.dropdownTriggerText,
                  !selectedInstruction && styles.dropdownPlaceholder,
                ]}
              >
                {getSelectedLabel()}
              </Text>
              <ArrowDownIcon
                width={20}
                height={20}
                stroke={Colors.textSecondary}
              />
            </Pressable>

            {selectedInstruction === "other" && (
              <TextInput
                style={styles.customInput}
                value={customInstruction}
                onChangeText={setCustomInstruction}
                placeholder="Enter specific instructions..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                maxLength={200}
              />
            )}
          </InlineContainer>

          {/* ------------------------------ Current Stock ----------------------------- */}
          <InlineContainer containerText="Current Stock">
            <Pressable
              style={styles.stockContainer}
              onPress={() => stockInputRef.current?.focus()}
            >
              <TextInput
                ref={stockInputRef}
                style={styles.stockInput}
                value={stock}
                onChangeText={handleStockChange}
                placeholder="0"
                keyboardType="number-pad"
                placeholderTextColor={Colors.textSecondary}
                maxLength={4}
              />
              <Text style={styles.stockLabel}>
                {parseInt(stock || "0") === 1 ? "unit left" : "units left"}
              </Text>
            </Pressable>
          </InlineContainer>

          {/* ---------------------------------- Photo --------------------------------- */}
          <InlineContainer containerText="Photo">
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <Pressable
                  style={styles.removePhotoButton}
                  onPress={showRemovePhotoOptions}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.photoButton} onPress={showImageOptions}>
                <ImageIcon
                  width={32}
                  height={32}
                  stroke={Colors.textSecondary}
                />
                <Text style={styles.photoText}>Add photo</Text>
              </Pressable>
            )}
          </InlineContainer>

          {/* -------------------------- Notification Settings ------------------------- */}
          <InlineContainer containerText="Notification Settings">
            {/* ----------------------------- Enable Reminder ---------------------------- */}
            <View style={[styles.settingRow, styles.horizontalLine]}>
              <View style={styles.settingInfo}>
                <BellIcon width={20} height={20} stroke={Colors.textPrimary} />
                <View>
                  <Text style={styles.settingTitle}>Enable reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when it's time
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.enabled}
                onValueChange={() => toggleNotification("enabled")}
                trackColor={{
                  false: Colors.textSecondary + "40",
                  true: Colors.primary,
                }}
                thumbColor={notifications.enabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {/* ----------------------- Hide Name in Notifications ----------------------- */}
            <View
              style={[
                styles.settingRow,
                styles.horizontalLine,
                !notifications.enabled && styles.settingRowDisabled,
              ]}
            >
              <View style={styles.settingInfo}>
                <EyeOffIcon
                  width={20}
                  height={20}
                  stroke={
                    notifications.enabled
                      ? Colors.textPrimary
                      : Colors.textSecondary
                  }
                />
                <View>
                  <Text
                    style={[
                      styles.settingTitle,
                      !notifications.enabled && styles.settingTextDisabled,
                    ]}
                  >
                    Hide medication name
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      !notifications.enabled && styles.settingTextDisabled,
                    ]}
                  >
                    Show "Medication" instead of name
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.hideName}
                onValueChange={() => toggleNotification("hideName")}
                disabled={!notifications.enabled}
                trackColor={{
                  false: Colors.textSecondary + "40",
                  true: Colors.primary,
                }}
                thumbColor={notifications.hideName ? "#fff" : "#f4f3f4"}
              />
            </View>

            {/* ----------------------------- Low Stock Alert ---------------------------- */}
            <View
              style={[
                styles.settingRow,
                !hasStock && styles.settingRowDisabled,
              ]}
            >
              <View style={styles.settingInfo}>
                <PackageIcon
                  width={20}
                  height={20}
                  stroke={hasStock ? Colors.textPrimary : Colors.textSecondary}
                />
                <View>
                  <Text
                    style={[
                      styles.settingTitle,
                      !hasStock && styles.settingTextDisabled,
                    ]}
                  >
                    Low stock alert
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      !hasStock && styles.settingTextDisabled,
                    ]}
                  >
                    {hasStock
                      ? "Notify when running low"
                      : "Enter stock to enable"}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.lowStockAlert && hasStock}
                onValueChange={() => toggleNotification("lowStockAlert")}
                disabled={!hasStock}
                trackColor={{
                  false: Colors.textSecondary + "40",
                  true: Colors.primary,
                }}
                thumbColor={notifications.lowStockAlert ? "#fff" : "#f4f3f4"}
              />
            </View>
          </InlineContainer>
        </ScrollView>

        <NextButton onPress={handleSave} disabled={!isValid() || isSaving} />
      </View>

      {/* ----------------------------- Dropdown Modal ----------------------------- */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
        >
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Instructions</Text>
              <Pressable onPress={() => setIsDropdownOpen(false)}>
                <Text style={styles.doneButton}>Done</Text>
              </Pressable>
            </View>

            <FlatList
              data={INSTRUCTION_OPTIONS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.dropdownItem,
                    selectedInstruction === item.id &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => handleSelectOption(item.id)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedInstruction === item.id &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedInstruction === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ----------------------------- Add Photo Modal ---------------------------- */}
      <BaseModal
        visible={imageModalVisible}
        title="Add Photo"
        message="Choose an option"
        onDismiss={() => setImageModalVisible(false)}
        buttons={[
          {
            text: "Take Photo",
            variant: "primary",
            onPress: () => {
              setImageModalVisible(false);
              takePhoto();
            },
          },
          {
            text: "Choose from Library",
            variant: "primary",
            onPress: () => {
              setImageModalVisible(false);
              pickImage();
            },
          },
          {
            text: "Cancel",
            onPress: () => setImageModalVisible(false),
          },
        ]}
      />

      {/* --------------------------- Remove Photo Modal --------------------------- */}
      <BaseModal
        visible={removePhotoModal}
        title="Remove Photo"
        message="Are you sure you want to remove this photo?"
        onDismiss={() => setRemovePhotoModal(false)}
        buttons={[
          {
            text: "Cancel",
            onPress: () => setRemovePhotoModal(false),
          },
          {
            text: "Remove",
            variant: "destructive",
            onPress: () => {
              setPhotoUri(null);
              setRemovePhotoModal(false);
            },
          },
        ]}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 16,
  },
  dropdownTrigger: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.textSecondary + "30",
  },
  dropdownTriggerText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: Colors.textSecondary,
  },
  customInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 15,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  dropdownMenu: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingTop: 16,
    paddingBottom: 32,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "20",
  },
  dropdownTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  doneButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + "10",
  },
  dropdownItemText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.textSecondary + "20",
    marginLeft: 20,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  stockInput: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  stockLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  photoButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.textSecondary + "30",
    borderStyle: "dashed",
    gap: 8,
  },
  photoText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  photoContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    height: 160,
    backgroundColor: Colors.surface,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  removePhotoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.textSecondary + "15",
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  settingTextDisabled: {
    color: Colors.textSecondary,
  },
});

export default Step4Screen;
