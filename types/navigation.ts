import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type SettingsParamList = {
  SettingsMain: undefined;
  Notifications: undefined;
  Sound: undefined;
  Theme: undefined;
};

export type AddMedicationParamList = {
  Step1: { mode?: "edit"; medicationId?: string };
  Step2: { name: string };
  Step3: { name: string; time: string };
  Step4: {
    name: string;
    time: string;
    scheduleType: string;
    frequency?: number;
    days?: number[];
  };
};

export type MainScreenParamList = {
  Home: undefined;
  Meds: undefined;
  Logs: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainScreenParamList };
  AddMedication: { screen?: keyof AddMedicationParamList };
  Settings: { screen?: keyof SettingsParamList };
};

export type NavProp = NativeStackNavigationProp<RootStackParamList>;
