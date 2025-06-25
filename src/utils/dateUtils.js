// src/utils/dateUtils.js
export const getCalendarDays = (selectedDate) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  // Get first day of the month
  const firstDay = new Date(year, month, 1);
  // Get last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of week for first day (0 = Sunday)
  const startDay = firstDay.getDay();
  
  const days = [];
  
  // Add days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push(prevDate);
  }
  
  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  // Add days from next month to fill the grid
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push(new Date(year, month + 1, day));
  }
  
  return days;
};

export const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  return date.getDate();
};

export const formatFullDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleDateString();
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

export const isToday = (date) => {
  if (!date || !(date instanceof Date)) return false;
  return isSameDay(date, new Date());
};

export const isSameMonth = (date, referenceDate) => {
  if (!date || !referenceDate) return false;
  return date.getMonth() === referenceDate.getMonth() && 
         date.getFullYear() === referenceDate.getFullYear();
};

// New utility functions for enhanced navigation
export const getNextMonth = (date) => {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth;
};

export const getPreviousMonth = (date) => {
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  return prevMonth;
};

export const getNextYear = (date) => {
  const nextYear = new Date(date);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return nextYear;
};

export const getPreviousYear = (date) => {
  const prevYear = new Date(date);
  prevYear.setFullYear(prevYear.getFullYear() - 1);
  return prevYear;
};

export const formatMonthYear = (date) => {
  if (!date || !(date instanceof Date)) return '';
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};