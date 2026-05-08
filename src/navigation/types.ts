export type TodayStackParamList = {
  Today: undefined;
  Calendar: undefined;
  Threads: undefined;
};

export type JobsStackParamList = {
  Jobs: undefined;
};

export type PeopleStackParamList = {
  People: undefined;
};

export type MoneyStackParamList = {
  Money: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  SettingsDetail: { id: string; label: string };
};

export type RootTabParamList = {
  TodayTab: undefined;
  JobsTab: undefined;
  PeopleTab: undefined;
  MoneyTab: undefined;
  SettingsTab: undefined;
};
