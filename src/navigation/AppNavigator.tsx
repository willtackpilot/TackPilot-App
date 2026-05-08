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
import CalendarScreen from '../screens/CalendarScreen';
import ThreadsScreen from '../screens/ThreadsScreen';
import type {
  RootTabParamList,
  TodayStackParamList,
  JobsStackParamList,
  PeopleStackParamList,
  MoneyStackParamList,
  SettingsStackParamList,
} from './types';

type IconName = keyof typeof Ionicons.glyphMap;
type TabKey = keyof RootTabParamList;

const TAB_ICONS: Record<TabKey, { focused: IconName; default: IconName }> = {
  TodayTab: { focused: 'home', default: 'home-outline' },
  JobsTab: { focused: 'briefcase', default: 'briefcase-outline' },
  PeopleTab: { focused: 'people', default: 'people-outline' },
  MoneyTab: { focused: 'wallet', default: 'wallet-outline' },
  SettingsTab: { focused: 'settings', default: 'settings-outline' },
};

const TAB_LABELS: Record<TabKey, string> = {
  TodayTab: 'Today',
  JobsTab: 'Jobs',
  PeopleTab: 'People',
  MoneyTab: 'Money',
  SettingsTab: 'Settings',
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const TodayStack = createNativeStackNavigator<TodayStackParamList>();
const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const PeopleStack = createNativeStackNavigator<PeopleStackParamList>();
const MoneyStack = createNativeStackNavigator<MoneyStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const stackScreenOptions = {
  header: () => <TopBar />,
  contentStyle: { backgroundColor: C.bg },
} as const;

function TodayStackNav() {
  return (
    <TodayStack.Navigator screenOptions={stackScreenOptions}>
      <TodayStack.Screen name="Today" component={TodayScreen} />
      <TodayStack.Screen name="Calendar" component={CalendarScreen} />
      <TodayStack.Screen name="Threads" component={ThreadsScreen} />
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

function PeopleStackNav() {
  return (
    <PeopleStack.Navigator screenOptions={stackScreenOptions}>
      <PeopleStack.Screen name="People" component={PeopleScreen} />
    </PeopleStack.Navigator>
  );
}

function MoneyStackNav() {
  return (
    <MoneyStack.Navigator screenOptions={stackScreenOptions}>
      <MoneyStack.Screen name="Money" component={MoneyScreen} />
    </MoneyStack.Navigator>
  );
}

function SettingsStackNav() {
  return (
    <SettingsStack.Navigator screenOptions={stackScreenOptions}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
    </SettingsStack.Navigator>
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
      <Tab.Navigator
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
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.default;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="TodayTab" component={TodayStackNav} />
        <Tab.Screen name="JobsTab" component={JobsStackNav} />
        <Tab.Screen name="PeopleTab" component={PeopleStackNav} />
        <Tab.Screen name="MoneyTab" component={MoneyStackNav} />
        <Tab.Screen name="SettingsTab" component={SettingsStackNav} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
