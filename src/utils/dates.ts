// src/utils/dates.ts
import {TimePeriod} from '../types';

// Format a date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format a date with a friendly display format
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get start date for a period (daily, weekly, monthly)
export const getPeriodStartDate = (period: TimePeriod): Date => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'daily':
      return today;
    case 'weekly':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return weekStart;
    case 'monthly':
      return new Date(today.getFullYear(), today.getMonth(), 1);
    default:
      return today;
  }
};

// Check if a date is within a specific period
export const isDateInPeriod = (date: Date, period: TimePeriod): boolean => {
  const checkDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'daily':
      return (
        checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear()
      );
    case 'weekly':
      const weekStart = getPeriodStartDate('weekly');
      return checkDate >= weekStart && checkDate <= today;
    case 'monthly':
      return (
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear()
      );
    default:
      return true;
  }
};

// Group dates by month for reporting
export const groupDatesByMonth = (
  dates: string[],
): Record<string, string[]> => {
  return dates.reduce((groups, dateString) => {
    const date = new Date(dateString);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`;

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(dateString);
    return groups;
  }, {} as Record<string, string[]>);
};
