import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type SettingsParamList = {
  SettingsMain: undefined;
  Notifications: undefined;
  Sound: undefined;
  Theme: undefined;
};

export type AddMedicationParamList = {
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Step4: undefined;
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
