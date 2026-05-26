import { useMemo, useRef } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Text } from "../../../../components/Text";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { Theme } from "../../../../constants/theme";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export const StockInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    onChange(text.replace(/[^0-9]/g, ""));
  };

  const count = parseInt(value || "0");
  const unitLabel = count === 1 ? t("addMedication.unitLeft") : t("addMedication.unitsLeft");

  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      style={styles.container}
      onPress={() => inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder="0"
        keyboardType="number-pad"
        placeholderTextColor={theme.textSecondary}
        maxLength={4}
      />
      <Text style={styles.label}>{unitLabel}</Text>
    </Pressable>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
  },
  input: {
    color: theme.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  label: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});
