import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {Transaction} from './index';

// Define the type for your root stack param list
export type RootStackParamList = {
  Home: undefined;
  DashboardScreen: undefined;
  AddTransaction: {transaction?: Transaction} | undefined;
  TransactionHistory: undefined;
  Budget: undefined;
  Reports: undefined;
  ReportScreen: undefined;
  MonthlySummary: undefined;
};

// Navigation prop types
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
