import { useMemo, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useTranslation } from "react-i18next";

import { NavProp } from "../../../types/navigation";
import { useMedicationStore } from "../../../store/medicationStore";

import AddMedicationHeader from "../components/AddMedicationHeader";
import NextButton from "../components/NextButton";
import InlineContainer from "../components/InlineContainer";

import {
  InstructionPicker,
  InstructionOption,
} from "./components/InstructionPicker";
import { StockInput } from "./components/StockInput";
import { PhotoPicker } from "./components/PhotoPicker";
import {
  NotificationSettingsPanel,
  NotificationSettings,
} from "./components/NotificationSettings";
import { useAppTheme } from "../../../theme/useAppTheme";
import { Theme } from "../../../constants/theme";

const Step4Screen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { draft, setDraft, saveMedication, updateMedication, clearDraft } =
    useMedicationStore();

  const mode = route.params?.mode;
  const medicationId = route.params?.medicationId;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* ------------------------------- Form State ------------------------------- */
  const [selectedInstruction, setSelectedInstruction] =
    useState<InstructionOption | null>(() => {
      if (!draft.note) return null;
      const knownIds = [
        "before_meal",
        "with_meal",
        "after_meal",
        "empty_stomach",
        "any",
      ] as const;

      return knownIds.includes(draft.note as any)
        ? (draft.note as InstructionOption)
        : "other";
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

  const hasStock = parseInt(stock, 10) > 0;

  /* ----------------------- Auto-enable low stock alert ---------------------- */
  useEffect(() => {
    if (hasStock && !notifications.lowStockAlert) {
      setNotifications((prev) => ({ ...prev, lowStockAlert: true }));
    }
  }, [stock]);

  /* ------------------------------- Validation ------------------------------- */
  const isValid = () =>
    !(selectedInstruction === "other" && !customInstruction.trim());

  /* ---------------------------------- Save ---------------------------------- */
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

      const updates = {
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

  const handleClose = () => {
    if (mode !== "edit") clearDraft();
    navigation.getParent()?.goBack();
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      enableOnAndroid
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.modal}>
        <AddMedicationHeader currentStep={4} title={t("addMedication.step4Title")} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <InlineContainer containerText={t("addMedication.instructions")}>
            <InstructionPicker
              selected={selectedInstruction}
              customText={customInstruction}
              onSelect={setSelectedInstruction}
              onCustomTextChange={setCustomInstruction}
            />
          </InlineContainer>

          <InlineContainer containerText={t("addMedication.currentStock")}>
            <StockInput value={stock} onChange={setStock} />
          </InlineContainer>

          <InlineContainer containerText={t("addMedication.photo")}>
            <PhotoPicker uri={photoUri} onChange={setPhotoUri} />
          </InlineContainer>

          <InlineContainer containerText={t("addMedication.notificationSettings")}>
            <NotificationSettingsPanel
              settings={notifications}
              hasStock={hasStock}
              onChange={setNotifications}
            />
          </InlineContainer>
        </ScrollView>

        <NextButton onPress={handleSave} disabled={!isValid() || isSaving} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    width: "100%",
    height: "90%",
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    overflow: "hidden",
  },
  content: { flex: 1, marginBottom: 12 },
  scrollContent: { paddingBottom: 20, gap: 16 },
});

export default Step4Screen;
