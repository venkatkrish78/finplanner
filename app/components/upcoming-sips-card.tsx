'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import Link from 'next/link';

interface UpcomingSipsCardProps {
  count: number;
  totalAmount: number;
}

export function UpcomingSipsCard({ count, totalAmount }: UpcomingSipsCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Upcoming SIPs
        </CardTitle>
        <div className="p-2 rounded-lg bg-emerald-50">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="text-2xl font-bold text-emerald-600">
          {count}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(totalAmount)} due in 30 days
        </p>
        <Link href="/bills?filter=sip">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-normal"
          >
            View SIP bills
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
