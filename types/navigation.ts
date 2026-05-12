import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type SettingsParamList = {
  SettingsMain: undefined;
  Notifications: undefined;
  Alarm: undefined;
  Appearance: undefined;
  Language: undefined;
  About: undefined;
};

export type AddMedicationParamList = {
  Step1: { mode?: "edit"; medicationId?: string } | undefined;
  Step2: { mode?: "edit"; medicationId?: string } | undefined;
  Step3: { mode?: "edit"; medicationId?: string } | undefined;
  Step4: { mode?: "edit"; medicationId?: string } | undefined;
};

export type MainScreenParamList = {
  Home: undefined;
  Meds: undefined;
  Calendar: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainScreenParamList };
  AddMedication: { screen?: keyof AddMedicationParamList; params?: any };
  Settings: { screen?: keyof SettingsParamList };
};

export type NavProp = NativeStackNavigationProp<RootStackParamList>;
