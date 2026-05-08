export type TodayStackParamList = {
  Today: undefined;
};

export type JobsStackParamList = {
  Jobs: undefined;
};

export type CalendarStackParamList = {
  Calendar: undefined;
};

export type MoneyStackParamList = {
  Money: undefined;
};

export type ThreadsStackParamList = {
  Threads: undefined;
  ThreadDetail: { subId: string; name: string };
};

export type PeopleStackParamList = {
  People: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  Connectors: undefined;
  SettingsDetail: { id: string; label: string };
};

export type TabsParamList = {
  TodayTab: undefined;
  JobsTab: undefined;
  CalendarTab: undefined;
  MoneyTab: undefined;
  ThreadsTab: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  PeopleStack: undefined;
  SettingsStack: undefined;
};
