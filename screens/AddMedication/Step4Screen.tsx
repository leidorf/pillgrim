import { useNavigation } from "@react-navigation/native";
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
} from "react-native";
import { NavProp } from "../../types/navigation";
import { Colors } from "../../constants/theme";
import CloseIcon from "../../assets/icons/close.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import ImageIcon from "../../assets/icons/image.svg";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import { useMedicationStore } from "../../store/medicationStore";
import NextButton from "../../components/NextButton";
import { useState, useRef, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InlineContainer from "../../components/InlineContainer";

const INSTRUCTION_OPTIONS = [
  { id: "before_meal", label: "Before meal" },
  { id: "with_meal", label: "With meal" },
  { id: "after_meal", label: "After meal" },
  { id: "empty_stomach", label: "Empty stomach" },
  { id: "any", label: "Doesn't matter" },
  { id: "other", label: "Other (specify)" },
] as const;

type InstructionOption = (typeof INSTRUCTION_OPTIONS)[number]["id"];

const Step4Screen = () => {
  const navigation = useNavigation<NavProp>();
  const { draft, setDraft, saveMedication } = useMedicationStore();

  const [selectedInstruction, setSelectedInstruction] =
    useState<InstructionOption | null>(null);
  const [customInstruction, setCustomInstruction] = useState("");
  const [stock, setStock] = useState<string>(draft.stock?.toString() || "");
  const [photoUri, setPhotoUri] = useState<string | null>(
    draft.photoUri || null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    console.log("Image picker would open");
  };

  const removePhoto = () => {
    setPhotoUri(null);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDraft(updates);

      setTimeout(() => {
        saveMedication();
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

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.modalContainer}>
        {/* --------------------------------- Header --------------------------------- */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <BackIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Optional Details</Text>
          <Pressable
            onPress={() => navigation.getParent()?.goBack()}
            style={styles.headerIcon}
          >
            <CloseIcon height={24} width={24} stroke={Colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ------------------------------ Note Dropdown ----------------------------- */}
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

          {/* ---------------------------------- Stock --------------------------------- */}
          <InlineContainer containerText="Current Stock">
            <View style={styles.stockContainer}>
              <TextInput
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
            </View>
          </InlineContainer>

          {/* ---------------------------------- Photo --------------------------------- */}
          <InlineContainer containerText="Photo">
            {photoUri ? (
              <View style={styles.photoContainer}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Photo added</Text>
                </View>
                <Pressable
                  style={styles.removePhotoButton}
                  onPress={removePhoto}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.photoButton} onPress={pickImage}>
                <ImageIcon
                  width={32}
                  height={32}
                  stroke={Colors.textSecondary}
                />
                <Text style={styles.photoText}>Add photo</Text>
              </Pressable>
            )}
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
  summaryCard: {
    backgroundColor: Colors.primary + "15",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    marginBottom: 8,
  },
  summaryName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  summaryDetails: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  summarySchedule: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    textTransform: "capitalize",
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
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: Colors.textPrimary,
    fontSize: 16,
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
});

export default Step4Screen;
