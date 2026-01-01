/**
 * Tests for Bill/Renewal Utility Functions
 */

import {
  calculateNextDueDate,
  getDaysUntil,
  computeBillStatus,
  parseReminderDays,
  shouldShowReminder,
  filterUpcomingBills,
  calculateAnnualAmount,
  calculateMonthlyAmount,
} from '../bill-utils';
import { BillFrequency, BillStatus } from '@prisma/client';

describe('calculateNextDueDate', () => {
  describe('WEEKLY frequency', () => {
    it('should add 7 days', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'WEEKLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-01-22');
    });
  });

  describe('MONTHLY frequency', () => {
    it('should add 1 month for mid-month dates', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'MONTHLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-02-15');
    });

    it('should handle month-end dates correctly (Jan 31 -> Feb 28)', () => {
      const current = new Date('2026-01-31');
      const next = calculateNextDueDate(current, 'MONTHLY');
      // February 2026 has 28 days
      expect(next.toISOString().split('T')[0]).toBe('2026-02-28');
    });

    it('should handle month-end dates correctly (Jan 31 -> Mar 31)', () => {
      const current = new Date('2026-01-31');
      const next1 = calculateNextDueDate(current, 'MONTHLY');
      const next2 = calculateNextDueDate(next1, 'MONTHLY');
      expect(next2.toISOString().split('T')[0]).toBe('2026-03-31');
    });

    it('should handle December to January rollover', () => {
      const current = new Date('2025-12-15');
      const next = calculateNextDueDate(current, 'MONTHLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-01-15');
    });
  });

  describe('QUARTERLY frequency', () => {
    it('should add 3 months', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'QUARTERLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-04-15');
    });

    it('should handle year rollover', () => {
      const current = new Date('2025-11-15');
      const next = calculateNextDueDate(current, 'QUARTERLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-02-15');
    });
  });

  describe('HALF_YEARLY frequency', () => {
    it('should add 6 months', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'HALF_YEARLY');
      expect(next.toISOString().split('T')[0]).toBe('2026-07-15');
    });
  });

  describe('YEARLY frequency', () => {
    it('should add 1 year', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'YEARLY');
      expect(next.toISOString().split('T')[0]).toBe('2027-01-15');
    });

    it('should handle leap year (Feb 29 -> Feb 28)', () => {
      const current = new Date('2024-02-29'); // 2024 is leap year
      const next = calculateNextDueDate(current, 'YEARLY');
      // 2025 is not a leap year, so should be Feb 28
      expect(next.toISOString().split('T')[0]).toBe('2025-02-28');
    });

    it('should handle leap year preservation (Feb 29 -> Feb 29)', () => {
      const current = new Date('2024-02-29');
      const next = calculateNextDueDate(current, 'YEARLY');
      const next2 = calculateNextDueDate(next, 'YEARLY');
      const next3 = calculateNextDueDate(next2, 'YEARLY');
      const next4 = calculateNextDueDate(next3, 'YEARLY');
      // 2028 is next leap year
      expect(next4.toISOString().split('T')[0]).toBe('2028-02-29');
    });
  });

  describe('ONE_TIME frequency', () => {
    it('should return the same date', () => {
      const current = new Date('2026-01-15');
      const next = calculateNextDueDate(current, 'ONE_TIME');
      expect(next.toISOString().split('T')[0]).toBe('2026-01-15');
    });
  });
});

describe('getDaysUntil', () => {
  it('should return 0 for today', () => {
    const today = new Date();
    expect(getDaysUntil(today)).toBe(0);
  });

  it('should return positive number for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(getDaysUntil(future)).toBe(7);
  });

  it('should return negative number for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 7);
    expect(getDaysUntil(past)).toBe(-7);
  });
});

describe('computeBillStatus', () => {
  it('should return PAID status for paid bills', () => {
    const dueDate = new Date();
    const status = computeBillStatus(dueDate, true);
    expect(status.status).toBe('PAID');
    expect(status.isOverdue).toBe(false);
    expect(status.isDueSoon).toBe(false);
  });

  it('should return OVERDUE for overdue unpaid bills', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 5);
    const status = computeBillStatus(overdue, false);
    expect(status.status).toBe('OVERDUE');
    expect(status.isOverdue).toBe(true);
    expect(status.daysUntilDue).toBe(-5);
  });

  it('should return PENDING with isDueSoon for bills due within threshold', () => {
    const dueSoon = new Date();
    dueSoon.setDate(dueSoon.getDate() + 5);
    const status = computeBillStatus(dueSoon, false, 7);
    expect(status.status).toBe('PENDING');
    expect(status.isDueSoon).toBe(true);
    expect(status.daysUntilDue).toBe(5);
  });

  it('should return PENDING without isDueSoon for bills due later', () => {
    const future = new Date();
    future.setDate(future.getDate() + 15);
    const status = computeBillStatus(future, false, 7);
    expect(status.status).toBe('PENDING');
    expect(status.isDueSoon).toBe(false);
    expect(status.daysUntilDue).toBe(15);
  });

  it('should set correct reminder status', () => {
    const oneDayAway = new Date();
    oneDayAway.setDate(oneDayAway.getDate() + 1);
    const status1 = computeBillStatus(oneDayAway, false);
    expect(status1.reminderStatus).toBe('1-day');

    const sevenDaysAway = new Date();
    sevenDaysAway.setDate(sevenDaysAway.getDate() + 7);
    const status7 = computeBillStatus(sevenDaysAway, false);
    expect(status7.reminderStatus).toBe('7-day');

    const thirtyDaysAway = new Date();
    thirtyDaysAway.setDate(thirtyDaysAway.getDate() + 30);
    const status30 = computeBillStatus(thirtyDaysAway, false);
    expect(status30.reminderStatus).toBe('30-day');
  });
});

describe('parseReminderDays', () => {
  it('should parse comma-separated string correctly', () => {
    const result = parseReminderDays('30,7,1');
    expect(result).toEqual([30, 7, 1]);
  });

  it('should handle spaces', () => {
    const result = parseReminderDays('30, 7, 1');
    expect(result).toEqual([30, 7, 1]);
  });

  it('should filter out invalid values', () => {
    const result = parseReminderDays('30,abc,7,1');
    expect(result).toEqual([30, 7, 1]);
  });

  it('should return default for empty string', () => {
    const result = parseReminderDays('');
    expect(result).toEqual([30, 7, 1]);
  });

  it('should sort in descending order', () => {
    const result = parseReminderDays('1,30,7');
    expect(result).toEqual([30, 7, 1]);
  });
});

describe('shouldShowReminder', () => {
  it('should return false for paid bills', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const result = shouldShowReminder(dueDate, [30, 7, 1], true);
    expect(result).toBe(false);
  });

  it('should return true when within reminder threshold', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const result = shouldShowReminder(dueDate, [30, 7, 1], false);
    expect(result).toBe(true);
  });

  it('should return false when outside reminder threshold', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 60);
    const result = shouldShowReminder(dueDate, [30, 7, 1], false);
    expect(result).toBe(false);
  });

  it('should return false for overdue bills', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 5);
    const result = shouldShowReminder(dueDate, [30, 7, 1], false);
    expect(result).toBe(false);
  });
});

describe('filterUpcomingBills', () => {
  it('should filter bills within date range', () => {
    const today = new Date();
    const bills = [
      { id: '1', dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), isPaid: false },
      { id: '2', dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), isPaid: false },
      { id: '3', dueDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000), isPaid: false },
      { id: '4', dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), isPaid: false },
    ];

    const upcoming = filterUpcomingBills(bills, 30);
    expect(upcoming).toHaveLength(2);
    expect(upcoming.map((b) => b.id)).toEqual(['1', '2']);
  });

  it('should exclude paid bills', () => {
    const today = new Date();
    const bills = [
      { id: '1', dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), isPaid: true },
      { id: '2', dueDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), isPaid: false },
    ];

    const upcoming = filterUpcomingBills(bills, 30);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].id).toBe('2');
  });
});

describe('calculateAnnualAmount', () => {
  it('should calculate correctly for different frequencies', () => {
    expect(calculateAnnualAmount(1000, 'MONTHLY')).toBe(12000);
    expect(calculateAnnualAmount(1000, 'QUARTERLY')).toBe(4000);
    expect(calculateAnnualAmount(1000, 'HALF_YEARLY')).toBe(2000);
    expect(calculateAnnualAmount(1000, 'YEARLY')).toBe(1000);
    expect(calculateAnnualAmount(1000, 'WEEKLY')).toBe(52000);
    expect(calculateAnnualAmount(1000, 'ONE_TIME')).toBe(0);
  });
});

describe('calculateMonthlyAmount', () => {
  it('should calculate correctly for different frequencies', () => {
    expect(calculateMonthlyAmount(1200, 'YEARLY')).toBe(100);
    expect(calculateMonthlyAmount(300, 'QUARTERLY')).toBe(100);
    expect(calculateMonthlyAmount(600, 'HALF_YEARLY')).toBe(100);
    expect(calculateMonthlyAmount(100, 'MONTHLY')).toBe(100);
    expect(Math.round(calculateMonthlyAmount(433, 'WEEKLY'))).toBe(100);
    expect(calculateMonthlyAmount(1000, 'ONE_TIME')).toBe(0);
  });
});
