import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import Logo from '../../assets/logo.svg';
import LoginScreen from '../screens/LoginScreen';
import ChatScreen from '../screens/ChatScreen';
import JobsScreen from '../screens/JobsScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  Chat: { focused: 'chatbubbles', default: 'chatbubbles-outline' },
  Jobs: { focused: 'briefcase', default: 'briefcase-outline' },
  Contacts: { focused: 'people', default: 'people-outline' },
  Profile: { focused: 'person-circle', default: 'person-circle-outline' },
};

function HeaderTitle() {
  return (
    <View style={styles.headerTitleRow}>
      <Logo width={120} height={28} />
    </View>
  );
}

function HeaderBackground() {
  return (
    <View style={styles.headerBg}>
      <View style={styles.headerBgSolid} />
      <LinearGradient
        colors={[COLORS.navy, COLORS.userBubble]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradientLine}
      />
    </View>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
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
          headerTitle: () => <HeaderTitle />,
          headerBackground: () => <HeaderBackground />,
          headerTitleAlign: 'center',
          headerStyle: { height: 100 },
          headerTintColor: COLORS.white,
          tabBarActiveTintColor: COLORS.white,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
          tabBarStyle: { backgroundColor: COLORS.navy, borderTopWidth: 0 },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = tabIcons[route.name];
            const iconName = focused ? icons.focused : icons.default;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Jobs" component={JobsScreen} />
        <Tab.Screen name="Contacts" component={ContactsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBg: {
    flex: 1,
  },
  headerBgSolid: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  headerGradientLine: {
    height: 3,
  },
});
