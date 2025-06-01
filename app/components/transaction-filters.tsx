
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { Category } from '@/lib/types';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  categories: Category[];
  onClearFilters: () => void;
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  categories,
  onClearFilters
}: TransactionFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const hasActiveFilters = 
    searchTerm || 
    selectedCategory !== 'all' || 
    selectedType !== 'all' || 
    dateRange.from || 
    dateRange.to;

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    if (type === 'from') {
      onDateRangeChange({ ...dateRange, from: date });
    } else {
      onDateRangeChange({ ...dateRange, to: date });
    }
  };

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
  };

  return (
    <Card className="professional-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search transactions, merchants, descriptions..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
            {hasActiveFilters && (
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="form-input justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Select Date Range</h4>
                    {(dateRange.from || dateRange.to) && (
                      <Button
                        onClick={clearDateRange}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">From</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => handleDateSelect(date, 'from')}
                        disabled={(date) =>
                          date > new Date() || (dateRange.to ? date > dateRange.to : false)
                        }
                        initialFocus
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">To</label>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => handleDateSelect(date, 'to')}
                        disabled={(date) =>
                          date > new Date() || (dateRange.from ? date < dateRange.from : false)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setIsDatePickerOpen(false)}
                      size="sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              className="form-input justify-center"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onSearchChange('')}
                  />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onCategoryChange('all')}
                  />
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Type: {selectedType}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onTypeChange('all')}
                  />
                </Badge>
              )}
              {(dateRange.from || dateRange.to) && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Date: {dateRange.from ? format(dateRange.from, "MMM dd") : 'Start'} - {dateRange.to ? format(dateRange.to, "MMM dd") : 'End'}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={clearDateRange}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
