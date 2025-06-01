
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
  type: 'positive' | 'warning' | 'info';
  message: string;
}

interface SmartInsightsWidgetProps {
  insights: Insight[];
  userName?: string;
}

export function SmartInsightsWidget({ insights, userName = 'there' }: SmartInsightsWidgetProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      default: return 'text-blue-600';
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50';
      case 'warning': return 'bg-orange-50';
      case 'info': return 'bg-blue-50';
      default: return 'bg-blue-50';
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'positive': return 'default';
      case 'warning': return 'destructive';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const financialTips = [
    "Consider setting up an emergency fund covering 3-6 months of expenses.",
    "Review your subscriptions monthly to avoid unnecessary charges.",
    "Track your spending patterns to identify areas for optimization.",
    "Set up automatic transfers to your savings account.",
    "Consider diversifying your investment portfolio."
  ];

  const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
          </div>
          <CardTitle className="text-lg">Smart Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Good day, {userName}! 👋</h3>
          <p className="text-sm text-muted-foreground">{randomTip}</p>
        </div>

        {/* Insights */}
        {insights.length === 0 ? (
          <div className="text-center py-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Keep using FinPlanner to get personalized insights!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className={`p-2 rounded-lg ${getInsightBg(insight.type)} flex-shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${getInsightColor(insight.type)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{insight.message}</p>
                  </div>
                  <Badge variant={getInsightBadge(insight.type) as any} className="text-xs">
                    {insight.type}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Additional Tips */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Financial Tip</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Regular financial reviews help you stay on track with your goals. 
            Consider scheduling a monthly money check-in!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
