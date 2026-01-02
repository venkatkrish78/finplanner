
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, Calendar, Receipt, Banknote, Building2, AlertTriangle, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import { computeBillStatus } from '@/lib/bill-utils';
import Link from 'next/link';

interface UpcomingItem {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  type: 'bill' | 'loan';
  provider?: string;
  status?: 'overdue' | 'due_soon' | 'upcoming';
}

interface UpcomingItemsWidgetProps {
  items: UpcomingItem[];
  onDataChange?: () => void;
}

export function UpcomingItemsWidget({ items, onDataChange }: UpcomingItemsWidgetProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffTime = itemDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    
    return itemDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getItemIcon = (type: 'bill' | 'loan') => {
    return type === 'bill' ? Receipt : Banknote;
  };

  const getItemColor = (type: 'bill' | 'loan') => {
    return type === 'bill' ? 'text-orange-600' : 'text-red-600';
  };

  const getItemBgColor = (type: 'bill' | 'loan') => {
    return type === 'bill' ? 'bg-orange-50' : 'bg-red-50';
  };

  // Enhanced item processing with status computation
  const processedItems = items.map(item => {
    const billStatus = computeBillStatus(new Date(item.dueDate), false, 7);
    let status: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming';
    
    if (billStatus.isOverdue) {
      status = 'overdue';
    } else if (billStatus.isDueSoon) {
      status = 'due_soon';
    }
    
    return {
      ...item,
      status,
      _sortOrder: status === 'overdue' ? 0 : status === 'due_soon' ? 1 : 2
    };
  });

  // Group and sort items
  const sortedItems = processedItems
    .sort((a, b) => {
      // First sort by status (overdue, due_soon, upcoming)
      if (a._sortOrder !== b._sortOrder) {
        return a._sortOrder - b._sortOrder;
      }
      // Then by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 6);

  // Group items by status
  const overdueItems = sortedItems.filter(item => item.status === 'overdue');
  const dueSoonItems = sortedItems.filter(item => item.status === 'due_soon');
  const upcomingItems = sortedItems.filter(item => item.status === 'upcoming');

  const getStatusBadge = (status: 'overdue' | 'due_soon' | 'upcoming') => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'due_soon':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"><Bell className="w-3 h-3 mr-1" />Due Soon</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">Upcoming</Badge>;
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <CardTitle className="text-lg">Upcoming Obligations</CardTitle>
        </div>
        <Link href="/bills">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">All caught up! No obligations due soon.</p>
          </div>
        ) : (
          <>
            {/* Overdue Section */}
            {overdueItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-red-600 uppercase">Overdue</h4>
                {overdueItems.map((item, index) => renderItem(item, index))}
              </div>
            )}

            {/* Due Soon Section */}
            {dueSoonItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-yellow-600 uppercase">Due Soon</h4>
                {dueSoonItems.map((item, index) => renderItem(item, index + overdueItems.length))}
              </div>
            )}

            {/* Upcoming Section */}
            {upcomingItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-600 uppercase">Upcoming</h4>
                {upcomingItems.map((item, index) => renderItem(item, index + overdueItems.length + dueSoonItems.length))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  function renderItem(item: typeof sortedItems[0], index: number) {
    const ItemIcon = getItemIcon(item.type);
    const itemColor = getItemColor(item.type);
    const itemBgColor = getItemBgColor(item.type);
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-muted"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg ${itemBgColor} flex-shrink-0`}>
              <ItemIcon className={`h-3 w-3 ${itemColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {item.provider && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Building2 className="h-3 w-3" />
                  <span>{item.provider}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(item.dueDate)}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold">{formatCurrency(item.amount)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          {getStatusBadge(item.status)}
          <div className="flex gap-1">
            <Link href={`/bills`}>
              <Button variant="outline" size="sm" className="h-6 text-xs">
                View
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
}
