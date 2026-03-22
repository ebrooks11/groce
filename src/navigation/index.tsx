import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ActiveListScreen from '../screens/ActiveListScreen';
import SavedListsScreen from '../screens/SavedListsScreen';
import SavedListDetailScreen from '../screens/SavedListDetailScreen';

// ─── Param Lists ──────────────────────────────────────────────────────────────

export type SavedListsStackParamList = {
  SavedLists: undefined;
  SavedListDetail: { listId: string };
};

type TabParamList = {
  ActiveTab: undefined;
  ListsTab: undefined;
};

// ─── Navigators ───────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>();
const SavedListsStack = createNativeStackNavigator<SavedListsStackParamList>();

function SavedListsNavigator() {
  return (
    <SavedListsStack.Navigator
      screenOptions={{
        headerLargeTitle: true,
        headerStyle: { backgroundColor: '#F2F2F7' },
        headerShadowVisible: false,
      }}
    >
      <SavedListsStack.Screen
        name="SavedLists"
        component={SavedListsScreen}
        options={{ title: 'Lists' }}
      />
      <SavedListsStack.Screen
        name="SavedListDetail"
        component={SavedListDetailScreen}
      />
    </SavedListsStack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const name =
              route.name === 'ActiveTab'
                ? focused
                  ? 'cart'
                  : 'cart-outline'
                : focused
                ? 'bookmark'
                : 'bookmark-outline';
            return <Ionicons name={name as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: { backgroundColor: '#F2F2F7' },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="ActiveTab"
          component={ActiveListScreen}
          options={{ title: 'Shopping' }}
        />
        <Tab.Screen
          name="ListsTab"
          component={SavedListsNavigator}
          options={{ title: 'Lists' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
