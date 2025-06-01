
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface UpcomingItem {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  type: 'bill' | 'loan';
}

interface UpcomingItemsWidgetProps {
  items: UpcomingItem[];
}

export function UpcomingItemsWidget({ items }: UpcomingItemsWidgetProps) {
  const sortedItems = items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getDateLabel = (date: Date) => {
    if (isPast(date)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getDateColor = (date: Date) => {
    if (isPast(date)) return 'destructive';
    if (isToday(date)) return 'default';
    if (isTomorrow(date)) return 'secondary';
    return 'outline';
  };

  const getIcon = (date: Date) => {
    if (isPast(date)) return AlertCircle;
    return Calendar;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle className="text-lg">Upcoming & Due</CardTitle>
        </div>
        <Badge variant="secondary" className="text-xs">
          {items.length} items
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming bills or payments</p>
          </div>
        ) : (
          sortedItems.map((item, index) => {
            const IconComponent = getIcon(new Date(item.dueDate));
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isPast(new Date(item.dueDate)) 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.type} • {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getDateColor(new Date(item.dueDate))} className="text-xs">
                    {getDateLabel(new Date(item.dueDate))}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
