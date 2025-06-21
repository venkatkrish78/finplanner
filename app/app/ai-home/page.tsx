import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AIChat from '@/components/ai/ai-chat';
import AIInsights from '@/components/ai/ai-insights';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  MessageCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default async function AIHomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {session.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Your AI-powered financial assistant is ready to help you make smarter money decisions
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Chat */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">AI Financial Assistant</h2>
            </div>
            <AIChat />
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Personalized Insights</h2>
            </div>
            <AIInsights />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg w-fit mb-3">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Smart Analysis</CardTitle>
              <CardDescription className="text-gray-600">
                AI analyzes your spending patterns and provides actionable insights to optimize your finances
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg w-fit mb-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Predictive Insights</CardTitle>
              <CardDescription className="text-gray-600">
                Get predictions about your financial future and personalized recommendations for goal achievement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg w-fit mb-3">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">Real-time Advice</CardTitle>
              <CardDescription className="text-gray-600">
                Instant financial advice tailored to your specific situation and spending habits
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
