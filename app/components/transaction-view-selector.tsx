
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

interface TransactionViewSelectorProps {
  view: 'monthly' | 'yearly';
  onViewChange: (view: 'monthly' | 'yearly') => void;
  year: number;
  onYearChange: (year: number) => void;
  month?: number;
  onMonthChange: (month: number) => void;
}

export function TransactionViewSelector({
  view,
  onViewChange,
  year,
  onYearChange,
  month,
  onMonthChange
}: TransactionViewSelectorProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handlePreviousPeriod = () => {
    if (view === 'monthly') {
      if (month === 1) {
        onMonthChange(12);
        onYearChange(year - 1);
      } else {
        onMonthChange((month || 1) - 1);
      }
    } else {
      onYearChange(year - 1);
    }
  };

  const handleNextPeriod = () => {
    if (view === 'monthly') {
      if (month === 12) {
        onMonthChange(1);
        onYearChange(year + 1);
      } else {
        onMonthChange((month || 1) + 1);
      }
    } else {
      onYearChange(year + 1);
    }
  };

  const canGoNext = () => {
    if (view === 'monthly') {
      return !(year === currentYear && (month || 1) >= currentMonth);
    } else {
      return year < currentYear;
    }
  };

  const getCurrentPeriodLabel = () => {
    if (view === 'monthly' && month) {
      return `${months.find(m => m.value === month)?.label} ${year}`;
    }
    return year.toString();
  };

  return (
    <Card className="professional-card">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-professional-blue" />
              <span className="font-medium text-slate-900">View:</span>
            </div>
            <Tabs value={view} onValueChange={(value) => onViewChange(value as 'monthly' | 'yearly')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" />
                  Yearly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Period Navigation */}
          <div className="flex items-center gap-4">
            {/* Period Selectors */}
            <div className="flex items-center gap-2">
              {view === 'monthly' && (
                <Select 
                  value={month?.toString()} 
                  onValueChange={(value) => onMonthChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px] form-input">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select 
                value={year.toString()} 
                onValueChange={(value) => onYearChange(parseInt(value))}
              >
                <SelectTrigger className="w-[100px] form-input">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousPeriod}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="px-4 py-2 bg-slate-100 rounded-md text-sm font-medium text-slate-900 min-w-[120px] text-center">
                {getCurrentPeriodLabel()}
              </div>
              
              <Button
                onClick={handleNextPeriod}
                variant="outline"
                size="sm"
                disabled={!canGoNext()}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
