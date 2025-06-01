
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Calendar, Receipt, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

interface UpcomingItem {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  type: 'bill' | 'loan';
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

  const sortedItems = items
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <CardTitle className="text-lg">Upcoming</CardTitle>
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
            <p className="text-muted-foreground text-sm">No upcoming payments</p>
          </div>
        ) : (
          sortedItems.map((item, index) => {
            const ItemIcon = getItemIcon(item.type);
            const itemColor = getItemColor(item.type);
            const itemBgColor = getItemBgColor(item.type);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg ${itemBgColor}`}>
                    <ItemIcon className={`h-3 w-3 ${itemColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
