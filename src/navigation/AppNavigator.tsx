import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { C } from '../constants/theme';
import TopBar from '../components/TopBar';
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import JobsScreen from '../screens/JobsScreen';
import PeopleScreen from '../screens/PeopleScreen';
import MoneyScreen from '../screens/MoneyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsDetailScreen from '../screens/SettingsDetailScreen';
import ConnectorsScreen from '../screens/ConnectorsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ThreadsScreen from '../screens/ThreadsScreen';
import ThreadDetailScreen, { ThreadDetailHeader } from '../screens/ThreadDetailScreen';
import type {
  RootStackParamList,
  TabsParamList,
  TodayStackParamList,
  JobsStackParamList,
  CalendarStackParamList,
  MoneyStackParamList,
  ThreadsStackParamList,
  PeopleStackParamList,
  SettingsStackParamList,
} from './types';

type IconName = keyof typeof Ionicons.glyphMap;
type TabKey = keyof TabsParamList;

const TAB_ICONS: Record<TabKey, IconName> = {
  TodayTab: 'home-outline',
  JobsTab: 'hammer-outline',
  CalendarTab: 'calendar-outline',
  MoneyTab: 'cash-outline',
  ThreadsTab: 'chatbubbles-outline',
};

const TAB_LABELS: Record<TabKey, string> = {
  TodayTab: 'Today',
  JobsTab: 'Jobs',
  CalendarTab: 'Calendar',
  MoneyTab: 'Money',
  ThreadsTab: 'Threads',
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();
const TodayStack = createNativeStackNavigator<TodayStackParamList>();
const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const MoneyStack = createNativeStackNavigator<MoneyStackParamList>();
const ThreadsStack = createNativeStackNavigator<ThreadsStackParamList>();
const PeopleStack = createNativeStackNavigator<PeopleStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const stackScreenOptions = {
  header: () => <TopBar />,
  contentStyle: { backgroundColor: C.bg },
} as const;

function TodayStackNav() {
  return (
    <TodayStack.Navigator screenOptions={stackScreenOptions}>
      <TodayStack.Screen name="Today" component={TodayScreen} />
    </TodayStack.Navigator>
  );
}

function JobsStackNav() {
  return (
    <JobsStack.Navigator screenOptions={stackScreenOptions}>
      <JobsStack.Screen name="Jobs" component={JobsScreen} />
    </JobsStack.Navigator>
  );
}

function CalendarStackNav() {
  return (
    <CalendarStack.Navigator screenOptions={stackScreenOptions}>
      <CalendarStack.Screen name="Calendar" component={CalendarScreen} />
    </CalendarStack.Navigator>
  );
}

function MoneyStackNav() {
  return (
    <MoneyStack.Navigator screenOptions={stackScreenOptions}>
      <MoneyStack.Screen name="Money" component={MoneyScreen} />
    </MoneyStack.Navigator>
  );
}

function ThreadsStackNav() {
  return (
    <ThreadsStack.Navigator screenOptions={stackScreenOptions}>
      <ThreadsStack.Screen name="Threads" component={ThreadsScreen} />
      <ThreadsStack.Screen
        name="ThreadDetail"
        component={ThreadDetailScreen}
        options={{ header: () => <ThreadDetailHeader /> }}
      />
    </ThreadsStack.Navigator>
  );
}

function PeopleStackNav() {
  return (
    <PeopleStack.Navigator screenOptions={stackScreenOptions}>
      <PeopleStack.Screen name="People" component={PeopleScreen} />
    </PeopleStack.Navigator>
  );
}

function SettingsStackNav() {
  return (
    <SettingsStack.Navigator screenOptions={stackScreenOptions}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Connectors" component={ConnectorsScreen} />
      <SettingsStack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
    </SettingsStack.Navigator>
  );
}

function TabsNav() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopWidth: 1,
          borderTopColor: C.sep,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="TodayTab" component={TodayStackNav} />
      <Tabs.Screen name="JobsTab" component={JobsStackNav} />
      <Tabs.Screen name="CalendarTab" component={CalendarStackNav} />
      <Tabs.Screen name="MoneyTab" component={MoneyStackNav} />
      <Tabs.Screen name="ThreadsTab" component={ThreadsStackNav} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.ink} />
      </View>
    );
  }

  if (!token) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={TabsNav} />
        <RootStack.Screen name="PeopleStack" component={PeopleStackNav} />
        <RootStack.Screen name="SettingsStack" component={SettingsStackNav} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
