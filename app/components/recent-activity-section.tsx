
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import Link from 'next/link';

interface RecentActivityItem {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
  categoryName: string;
}

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
}

export function RecentActivitySection({ activities }: RecentActivitySectionProps) {
  const getTransactionIcon = (type: string) => {
    return type === 'INCOME' ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBg = (type: string) => {
    return type === 'INCOME' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </div>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent transactions</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const IconComponent = getTransactionIcon(activity.type);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTransactionBg(activity.type)}`}>
                    <IconComponent className={`h-4 w-4 ${getTransactionColor(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.description}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {activity.categoryName}
                      </Badge>
                      <span>•</span>
                      <span>{format(new Date(activity.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getTransactionColor(activity.type)}`}>
                  {activity.type === 'INCOME' ? '+' : '-'}{formatCurrency(activity.amount)}
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
