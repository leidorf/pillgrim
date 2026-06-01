import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import BaseModal from "../../../components/BaseModal";

type Props = {
  visible: boolean;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onClose: () => void;
};

const ExportModal = ({ visible, onExportCSV, onExportPDF, onClose }: Props) => {
  const { t } = useTranslation();

  const buttons = useCallback(
    () => [
      {
        text: t("export.csv"),
        onPress: onExportCSV,
        variant: "primary" as const,
      },
      {
        text: t("export.pdf"),
        onPress: onExportPDF,
        variant: "primary" as const,
      },
      {
        text: t("export.cancel"),
        onPress: onClose,
      },
    ],
    [t, onExportCSV, onExportPDF, onClose],
  );

  return (
    <BaseModal
      visible={visible}
      title={t("export.title")}
      buttons={buttons()}
      onDismiss={onClose}
    />
  );
};

export default ExportModal;
