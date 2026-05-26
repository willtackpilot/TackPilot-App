import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { CreateMenuProvider, navigationRef } from '../context/CreateMenuContext';
import { C } from '../constants/theme';
import TopBar from '../components/TopBar';
import { useJobs } from '../hooks/useJobs';
import { useFinances } from '../hooks/useFinances';
import { useThreadList } from '../hooks/useThreadList';
import { usePolling } from '../hooks/usePolling';
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import JobsScreen from '../screens/JobsScreen';
import PeopleScreen from '../screens/PeopleScreen';
import MoneyScreen from '../screens/MoneyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsDetailScreen from '../screens/SettingsDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConnectorsScreen from '../screens/ConnectorsScreen';
import AgentsScreen from '../screens/AgentsScreen';
import ChannelsScreen from '../screens/ChannelsScreen';
import BillingScreen from '../screens/BillingScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ThreadsScreen from '../screens/ThreadsScreen';
import ThreadDetailScreen, { ThreadDetailHeader } from '../screens/ThreadDetailScreen';
import JobDetailScreen, { JobDetailHeader } from '../screens/JobDetailScreen';
import TeamScreen from '../screens/TeamScreen';
import AIChatScreen, { AIChatHeader } from '../screens/AIChatScreen';
import NewJobScreen from '../screens/NewJobScreen';
import NewCrewScreen from '../screens/NewCrewScreen';
import NewInvoiceScreen from '../screens/NewInvoiceScreen';
import NewEventScreen from '../screens/NewEventScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
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
      <JobsStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ header: () => <JobDetailHeader /> }}
      />
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
      <SettingsStack.Screen name="Profile" component={ProfileScreen} />
      <SettingsStack.Screen name="Agents" component={AgentsScreen} />
      <SettingsStack.Screen name="Channels" component={ChannelsScreen} />
      <SettingsStack.Screen name="Billing" component={BillingScreen} />
      <SettingsStack.Screen name="Team" component={TeamScreen} />
      <SettingsStack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
    </SettingsStack.Navigator>
  );
}

function TabsNav() {
  // Badge data. NOTE: each hook is also called inside its corresponding
  // screen, so the fetch fires twice (here + screen). Acceptable for now;
  // see docs/TECH_DEBT.md.
  const { jobs } = useJobs();
  const { data: finances } = useFinances();
  const { totalUnread, refetch: refetchThreads } = useThreadList();

  // Foreground poll so the Threads tab badge picks up inbound texts
  // without the user having to refocus the tab. Mirrors the bell.
  usePolling(refetchThreads, 60_000);

  const jobsActive = jobs.filter((j) => j.status === 'in_progress').length;
  const overdueCount = finances?.health_summary?.overdue_count ?? 0;

  const tabBadges: Partial<Record<TabKey, number>> = {
    JobsTab: jobsActive,
    MoneyTab: overdueCount,
    ThreadsTab: totalUnread,
  };

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => {
        const badgeValue = tabBadges[route.name];
        return {
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
          tabBarBadge: badgeValue && badgeValue > 0 ? badgeValue : undefined,
          tabBarBadgeStyle: {
            backgroundColor: C.red,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            lineHeight: 14,
          },
        };
      }}
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
  const { token, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.ink} />
      </View>
    );
  }

  if (!token || !currentUser) {
    return (
      <NavigationContainer ref={navigationRef}>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <CreateMenuProvider>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={TabsNav} />
          <RootStack.Screen name="PeopleStack" component={PeopleStackNav} />
          <RootStack.Screen name="SettingsStack" component={SettingsStackNav} />
          <RootStack.Group
            screenOptions={{ presentation: 'modal', headerShown: false }}
          >
            <RootStack.Screen
              name="AIChat"
              component={AIChatScreen}
              options={{ header: () => <AIChatHeader /> }}
            />
            <RootStack.Screen name="NewJob" component={NewJobScreen} />
            <RootStack.Screen name="NewCrew" component={NewCrewScreen} />
            <RootStack.Screen name="NewInvoice" component={NewInvoiceScreen} />
            <RootStack.Screen name="NewEvent" component={NewEventScreen} />
            <RootStack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
          </RootStack.Group>
        </RootStack.Navigator>
      </CreateMenuProvider>
    </NavigationContainer>
  );
}
