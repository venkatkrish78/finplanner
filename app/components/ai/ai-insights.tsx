'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  Activity,
  X
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  isRead: boolean;
  createdAt: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'SPENDING_PATTERN': return <Activity className="h-4 w-4" />;
    case 'BUDGET_ALERT': return <AlertTriangle className="h-4 w-4" />;
    case 'GOAL_PROGRESS': return <Target className="h-4 w-4" />;
    case 'INVESTMENT_SUGGESTION': return <TrendingUp className="h-4 w-4" />;
    case 'BILL_REMINDER': return <CreditCard className="h-4 w-4" />;
    case 'SAVINGS_OPPORTUNITY': return <PiggyBank className="h-4 w-4" />;
    case 'DEBT_OPTIMIZATION': return <DollarSign className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 3: return 'destructive';
    case 2: return 'default';
    case 1: return 'secondary';
    default: return 'secondary';
  }
};

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 3: return 'High';
    case 2: return 'Medium';
    case 1: return 'Low';
    default: return 'Low';
  }
};

interface AIInsightsProps {
  className?: string;
}

export default function AIInsights({ className }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/insights');
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = async (insightId: string) => {
    // For now, just remove from UI - you can implement API call to mark as read
    fetch(`/api/ai/insights/manage?id=${insightId}`, { method: "DELETE" }).then(() => setInsights(prev => prev.filter(insight => insight.id !== insightId)));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchInsights} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Insights
          {insights.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {insights.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No insights available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start using the app to get personalized financial insights!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge 
                        variant={getPriorityColor(insight.priority) as any}
                        className="text-xs"
                      >
                        {getPriorityText(insight.priority)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => dismissInsight(insight.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

