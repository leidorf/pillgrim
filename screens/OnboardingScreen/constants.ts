import { AddMedicationMock } from "./mocks/AddMedicationMock";
import { HistoryMock } from "./mocks/HistoryMock";
import { ManageMock } from "./mocks/ManageMock";
import { PermissionMock } from "./mocks/PermissionMock";
import { WelcomeMock } from "./mocks/WelcomeMock";
import { OnboardingSlideConfig } from "./types";

export const ONBOARDING_SLIDES: readonly OnboardingSlideConfig[] = [
  { key: "welcome", Mock: WelcomeMock },
  { key: "addMedication", Mock: AddMedicationMock },
  { key: "manage", Mock: ManageMock },
  { key: "history", Mock: HistoryMock },
  { key: "permission", Mock: PermissionMock },
];
