
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { AddGoalDialog } from '@/components/add-goal-dialog'
import { GoalList } from '@/components/goal-list'

interface GoalsData {
  goals: any[]
  stats: {
    totalGoals: number
    targetAmount: number
    currentAmount: number
    totalProgressAmount: number
    averageProgress: number
    completedGoals: number
    activeGoals: number
  }
}

export default function GoalsPage() {
  const [data, setData] = useState<GoalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchGoalsData()
  }, [])

  const fetchGoalsData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/goals?includeInvestments=true')
      if (response.ok) {
        const goals = await response.json()
        
        // Calculate stats using dynamic progress
        const totalGoals = goals?.length || 0
        const activeGoals = goals?.filter((g: any) => g.status === 'ACTIVE').length || 0
        const completedGoals = goals?.filter((g: any) => g.status === 'COMPLETED').length || 0
        const targetAmount = goals?.reduce((sum: number, g: any) => sum + g.targetAmount, 0) || 0
        const currentAmount = goals?.reduce((sum: number, g: any) => sum + g.currentAmount, 0) || 0
        const totalProgressAmount = goals?.reduce((sum: number, g: any) => sum + (g.totalProgress || g.currentAmount), 0) || 0
        const averageProgress = totalGoals > 0 ? (totalProgressAmount / targetAmount) * 100 : 0

        setData({
          goals: goals || [],
          stats: {
            totalGoals,
            targetAmount,
            currentAmount,
            totalProgressAmount,
            averageProgress,
            completedGoals,
            activeGoals
          }
        })
      }
    } catch (error) {
      console.error('Error fetching goals data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Error loading goals</h1>
          <p className="text-slate-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              Financial Goals
            </h1>
            <p className="text-slate-600 mt-1">
              Track your progress towards financial milestones
            </p>
          </div>
          <Button 
            className="bg-professional-blue hover:bg-professional-blue-dark text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Goals
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {data.stats.totalGoals}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                    {data.stats.activeGoals} Active
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                    {data.stats.completedGoals} Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Target Amount
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(data.stats.targetAmount)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Total target
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Progress
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-professional-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-professional-blue">
                  {formatCurrency(data.stats.totalProgressAmount)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Contributions + Investments
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="professional-card hover-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Average Progress
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {data.stats.averageProgress.toFixed(1)}%
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(data.stats.averageProgress, 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GoalList goals={data.goals} onGoalUpdated={fetchGoalsData} />
        </motion.div>
      </motion.div>

      {/* Add Goal Dialog */}
      <AddGoalDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onGoalAdded={() => {
          setShowAddDialog(false)
          fetchGoalsData()
        }}
      />
    </div>
  )
}
