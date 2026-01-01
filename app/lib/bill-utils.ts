/**
 * Bill/Renewal Utility Functions
 * Handles date rolling, status computation, and reminder logic
 */

import { BillFrequency, BillStatus } from '@prisma/client';

export interface BillStatusInfo {
  status: BillStatus;
  daysUntilDue: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  reminderStatus: 'none' | '30-day' | '7-day' | '1-day';
}

/**
 * Calculate the next due date based on current due date and frequency
 * Handles edge cases like month-end dates
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  frequency: BillFrequency
): Date {
  const nextDate = new Date(currentDueDate);

  switch (frequency) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case 'MONTHLY':
      // Handle month-end dates properly
      const currentDay = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      
      // If the day changed (e.g., Jan 31 -> Mar 3), set to last day of month
      if (nextDate.getDate() !== currentDay) {
        nextDate.setDate(0); // Sets to last day of previous month
      }
      break;

    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;

    case 'HALF_YEARLY':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;

    case 'YEARLY':
      // Handle leap year edge case for Feb 29
      const currentMonth = nextDate.getMonth();
      const currentDate = nextDate.getDate();
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      // If we were on Feb 29 and next year isn't a leap year, adjust to Feb 28
      if (currentMonth === 1 && currentDate === 29 && nextDate.getDate() !== 29) {
        nextDate.setDate(28);
      }
      break;

    case 'ONE_TIME':
      // One-time bills don't roll - return the same date
      return currentDueDate;

    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  return nextDate;
}

/**
 * Get the number of days until a date
 */
export function getDaysUntil(targetDate: Date | string): number {
  const now = new Date();
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Convert to Date if string
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  const diffTime = targetStart.getTime() - nowStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Compute the status of a bill based on due date and paid status
 */
export function computeBillStatus(
  dueDate: Date | string,
  isPaid: boolean,
  dueSoonThreshold: number = 7
): BillStatusInfo {
  if (isPaid) {
    return {
      status: 'PAID',
      daysUntilDue: 0,
      isOverdue: false,
      isDueSoon: false,
      reminderStatus: 'none',
    };
  }

  const daysUntilDue = getDaysUntil(dueDate);

  let status: BillStatus;
  let isOverdue = false;
  let isDueSoon = false;
  let reminderStatus: 'none' | '30-day' | '7-day' | '1-day' = 'none';

  if (daysUntilDue < 0) {
    status = 'OVERDUE';
    isOverdue = true;
  } else if (daysUntilDue <= dueSoonThreshold) {
    status = 'PENDING';
    isDueSoon = true;

    // Set reminder status
    if (daysUntilDue <= 1) {
      reminderStatus = '1-day';
    } else if (daysUntilDue <= 7) {
      reminderStatus = '7-day';
    }
  } else {
    status = 'PENDING';
    
    // Check for 30-day reminder
    if (daysUntilDue <= 30) {
      reminderStatus = '30-day';
    }
  }

  return {
    status,
    daysUntilDue,
    isOverdue,
    isDueSoon,
    reminderStatus,
  };
}

/**
 * Parse reminder days string to array
 */
export function parseReminderDays(reminderDaysStr: string): number[] {
  if (!reminderDaysStr || reminderDaysStr.trim() === '') {
    return [30, 7, 1]; // Default
  }

  return reminderDaysStr
    .split(',')
    .map((d) => parseInt(d.trim(), 10))
    .filter((d) => !isNaN(d) && d > 0)
    .sort((a, b) => b - a); // Sort descending
}

/**
 * Check if a bill should show a reminder based on its due date and reminder settings
 */
export function shouldShowReminder(
  dueDate: Date | string,
  reminderDays: number[],
  isPaid: boolean = false
): boolean {
  if (isPaid) return false;

  const daysUntilDue = getDaysUntil(dueDate);

  // Show reminder if we're within any of the reminder day thresholds
  return reminderDays.some((threshold) => daysUntilDue <= threshold && daysUntilDue >= 0);
}

/**
 * Get upcoming bills/renewals within a date range
 */
export function filterUpcomingBills<
  T extends { dueDate: Date; isPaid?: boolean }
>(items: T[], daysAhead: number = 30): T[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return items.filter((item) => {
    if (item.isPaid) return false;
    const dueDate = new Date(item.dueDate);
    return dueDate >= now && dueDate <= futureDate;
  });
}

/**
 * Get month boundaries for filtering (current calendar month)
 */
export function getCurrentMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * Format due date for display with relative timing
 */
export function formatDueDateDisplay(dueDate: Date | string): string {
  const daysUntil = getDaysUntil(dueDate);
  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;

  if (daysUntil < 0) {
    return `${Math.abs(daysUntil)} days overdue`;
  } else if (daysUntil === 0) {
    return 'Due today';
  } else if (daysUntil === 1) {
    return 'Due tomorrow';
  } else if (daysUntil <= 7) {
    return `Due in ${daysUntil} days`;
  } else if (daysUntil <= 30) {
    return `Due in ${daysUntil} days`;
  } else {
    // Format as date
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

/**
 * Get frequency display label
 */
export function getFrequencyLabel(frequency: BillFrequency): string {
  const labels: Record<BillFrequency, string> = {
    ONE_TIME: 'One-time',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    HALF_YEARLY: 'Half-yearly',
    YEARLY: 'Yearly',
  };

  return labels[frequency] || frequency;
}

/**
 * Calculate annual equivalent amount for any frequency
 */
export function calculateAnnualAmount(amount: number, frequency: BillFrequency): number {
  const multipliers: Record<BillFrequency, number> = {
    ONE_TIME: 0, // Don't count in annual
    WEEKLY: 52,
    MONTHLY: 12,
    QUARTERLY: 4,
    HALF_YEARLY: 2,
    YEARLY: 1,
  };

  return amount * multipliers[frequency];
}

/**
 * Calculate monthly equivalent amount for any frequency
 */
export function calculateMonthlyAmount(amount: number, frequency: BillFrequency): number {
  const divisors: Record<BillFrequency, number> = {
    ONE_TIME: 0, // Don't count in monthly
    WEEKLY: 4.33, // Average weeks per month
    MONTHLY: 1,
    QUARTERLY: 3,
    HALF_YEARLY: 6,
    YEARLY: 12,
  };

  return frequency === 'ONE_TIME' ? 0 : amount / divisors[frequency];
}
