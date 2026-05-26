import PillIcon from "../assets/icons/pill.svg";
import TabletsIcon from "../assets/icons/tablets.svg";
import SyringeIcon from "../assets/icons/syringe.svg";
import SyrupIcon from "../assets/icons/syrup.svg";
import PipetteIcon from "../assets/icons/pipette.svg";
import SprayCanIcon from "../assets/icons/spray-can.svg";
import CreamIcon from "../assets/icons/cream.svg";

export const MED_FORMS = [
  { id: "capsule", label: "Capsule", labelKey: "medicationForms.capsule", Icon: PillIcon },
  { id: "tablet", label: "Tablet", labelKey: "medicationForms.tablet", Icon: TabletsIcon },
  { id: "syrup", label: "Syrup", labelKey: "medicationForms.syrup", Icon: SyrupIcon },
  { id: "drop", label: "Drop", labelKey: "medicationForms.drop", Icon: PipetteIcon },
  { id: "injection", label: "Injection", labelKey: "medicationForms.injection", Icon: SyringeIcon },
  { id: "spray", label: "Spray", labelKey: "medicationForms.spray", Icon: SprayCanIcon },
  { id: "cream", label: "Cream", labelKey: "medicationForms.cream", Icon: CreamIcon },
];
