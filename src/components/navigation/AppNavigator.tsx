import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {Text, View, StyleSheet} from 'react-native';

// Import screens
import Dashboard from '../screens/Dashboard';
import AddTransaction from '../screens/AddTransaction';
import TransactionHistory from '../screens/TransactionHistory';
import BudgetScreen from '../screens/BudgetScreen';
import ReportScreen from '../screens/ReportScreen';
import MonthlySummary from '../screens/MonthlySummary';

// Create navigators with correct typing
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Simple icon component
interface TabIconProps {
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({name, focused}) => {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconFocused]}>
        {name}
      </Text>
    </View>
  );
};

// Stack navigator for main screens - defined OUTSIDE of AppNavigator
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="DashboardScreen" component={Dashboard} />
      <Stack.Screen name="AddTransaction" component={AddTransaction} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
    </Stack.Navigator>
  );
};

// Stack navigator for reports - defined OUTSIDE of AppNavigator
const ReportStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
      <Stack.Screen name="MonthlySummary" component={MonthlySummary} />
    </Stack.Navigator>
  );
};

// Main App Navigator with bottom tabs
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({focused}) => <TabIcon name="💰" focused={focused} />,
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({focused}) => <TabIcon name="📊" focused={focused} />,
            tabBarLabel: 'Budget',
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportStack}
          options={{
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({focused}) => <TabIcon name="📈" focused={focused} />,
            tabBarLabel: 'Reports',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  iconFocused: {
    fontSize: 22,
  },
});

export default AppNavigator;
