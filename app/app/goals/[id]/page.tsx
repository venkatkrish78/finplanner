
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Link,
  Unlink
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { GoalType, GoalStatus } from '@/lib/types'
import { AddGoalContributionDialog } from '@/components/add-goal-contribution-dialog'
import { EditGoalDialog } from '@/components/edit-goal-dialog'
import { LinkInvestmentDialog } from '@/components/link-investment-dialog'
import { toast } from 'sonner'

interface GoalDetail {
  id: string
  name: string
  description?: string
  goalType: GoalType
  targetAmount: number
  currentAmount: number
  targetDate?: string
  status: GoalStatus
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
  }
  contributions: any[]
  investmentLinks?: any[]
  investments?: any[]
  linkedInvestmentValue: number
  dynamicProgress: number
  totalProgress: number
  createdAt: string
  updatedAt: string
}

const goalTypeColors = {
  [GoalType.SAVINGS]: 'bg-green-100 text-green-800',
  [GoalType.DEBT_PAYOFF]: 'bg-red-100 text-red-800',
  [GoalType.INVESTMENT]: 'bg-blue-100 text-blue-800',
  [GoalType.EMERGENCY_FUND]: 'bg-orange-100 text-orange-800',
  [GoalType.EDUCATION]: 'bg-purple-100 text-purple-800',
  [GoalType.HOUSE]: 'bg-indigo-100 text-indigo-800',
  [GoalType.VACATION]: 'bg-pink-100 text-pink-800',
  [GoalType.RETIREMENT]: 'bg-gray-100 text-gray-800',
  [GoalType.OTHER]: 'bg-yellow-100 text-yellow-800'
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [goal, setGoal] = useState<GoalDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableInvestments, setAvailableInvestments] = useState<any[]>([])
  
  // Dialog states
  const [showContributionDialog, setShowContributionDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchGoalDetail()
      fetchAvailableInvestments()
    }
  }, [params.id])

  const fetchGoalDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/goals/${params.id}`)
      if (response.ok) {
        const goalData = await response.json()
        setGoal(goalData)
      } else {
        toast.error('Failed to load goal details')
      }
    } catch (error) {
      console.error('Error fetching goal detail:', error)
      toast.error('Error loading goal details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableInvestments = async () => {
    try {
      const response = await fetch('/api/investments?includeGoals=true')
      if (response.ok) {
        const investments = await response.json()
        setAvailableInvestments(investments)
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
    }
  }

  const handleLinkInvestment = async (investmentId: string, allocation: number = 100) => {
    try {
      const response = await fetch(`/api/goals/${params.id}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId, allocation })
      })

      if (response.ok) {
        fetchGoalDetail()
        fetchAvailableInvestments()
        toast.success('Investment linked successfully!')
      } else {
        toast.error('Failed to link investment')
      }
    } catch (error) {
      console.error('Error linking investment:', error)
      toast.error('Error linking investment')
    }
  }

  const handleUnlinkInvestment = async (linkId: string) => {
    try {
      const response = await fetch(`/api/goals/${params.id}/investments/${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchGoalDetail()
        fetchAvailableInvestments()
        toast.success('Investment unlinked successfully!')
      } else {
        toast.error('Failed to unlink investment')
      }
    } catch (error) {
      console.error('Error unlinking investment:', error)
      toast.error('Error unlinking investment')
    }
  }

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Goal deleted successfully!')
        router.push('/goals')
      } else {
        toast.error('Failed to delete goal')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Error deleting goal')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Goal not found</h1>
          <Button 
            onClick={() => router.push('/goals')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </div>
    )
  }

  const linkedInvestments = [
    ...(goal.investmentLinks?.map(link => ({
      ...link.investment,
      linkId: link.id,
      allocation: link.allocation,
      allocatedValue: link.investment.currentValue * (link.allocation / 100),
      linkType: 'linked'
    })) || []),
    ...(goal.investments?.map(investment => ({
      ...investment,
      linkId: null,
      allocation: 100,
      allocatedValue: investment.currentValue,
      linkType: 'direct'
    })) || [])
  ]

  const remainingAmount = Math.max(0, goal.targetAmount - goal.totalProgress)
  const progressPercentage = Math.min((goal.totalProgress / goal.targetAmount) * 100, 100)

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/goals')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goals
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                {goal.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={goalTypeColors[goal.goalType]}>
                  {goal.goalType.replace('_', ' ')}
                </Badge>
                <Badge variant={goal.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {goal.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleDeleteGoal}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Goal Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {goal.description && (
                  <p className="text-slate-600">{goal.description}</p>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Target</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(goal.targetAmount)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Contributions</p>
                    <p className="font-semibold text-green-600">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Investments</p>
                    <p className="font-semibold text-purple-600">{formatCurrency(goal.linkedInvestmentValue)}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Remaining</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(remainingAmount)}</p>
                  </div>
                </div>

                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => setShowContributionDialog(true)}
                  disabled={goal.status !== 'ACTIVE'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contribution
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowLinkDialog(true)}
                  disabled={goal.status !== 'ACTIVE'}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link Investment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Linked Investments */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Linked Investments ({linkedInvestments.length})</CardTitle>
              <Button 
                variant="outline"
                onClick={() => setShowLinkDialog(true)}
                disabled={goal.status !== 'ACTIVE'}
              >
                <Plus className="h-4 w-4 mr-2" />
                Link Investment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {linkedInvestments.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No investments linked</h3>
                <p className="text-slate-600 mb-4">Link investments to track their contribution to this goal</p>
                <Button 
                  onClick={() => setShowLinkDialog(true)}
                  disabled={goal.status !== 'ACTIVE'}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link Investment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {linkedInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-slate-100">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{investment.name}</h3>
                        <p className="text-sm text-slate-600">
                          {investment.assetClass} • {investment.allocation}% allocation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(investment.allocatedValue)}
                      </div>
                      <p className="text-sm text-slate-600">
                        of {formatCurrency(investment.currentValue)}
                      </p>
                      {investment.linkType === 'linked' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkInvestment(investment.linkId)}
                          className="text-red-600 hover:text-red-700 mt-1"
                        >
                          <Unlink className="h-3 w-3 mr-1" />
                          Unlink
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contributions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {goal.contributions.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No contributions yet</h3>
                <p className="text-slate-600 mb-4">Start contributing to reach your goal faster</p>
                <Button 
                  onClick={() => setShowContributionDialog(true)}
                  disabled={goal.status !== 'ACTIVE'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contribution
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {goal.contributions.slice(0, 5).map((contribution) => (
                  <div key={contribution.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{formatCurrency(contribution.amount)}</p>
                      {contribution.note && (
                        <p className="text-sm text-slate-600">{contribution.note}</p>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      {goal && (
        <>
          <AddGoalContributionDialog
            open={showContributionDialog}
            onOpenChange={setShowContributionDialog}
            goal={{
              ...goal,
              targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
              createdAt: new Date(goal.createdAt),
              updatedAt: new Date(goal.updatedAt),
              contributions: goal.contributions || []
            }}
            onContributionAdded={() => {
              fetchGoalDetail()
              setShowContributionDialog(false)
            }}
          />
          <EditGoalDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            goal={{
              ...goal,
              targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
              createdAt: new Date(goal.createdAt),
              updatedAt: new Date(goal.updatedAt),
              contributions: goal.contributions || []
            }}
            onGoalUpdated={() => {
              fetchGoalDetail()
              setShowEditDialog(false)
            }}
          />
          <LinkInvestmentDialog
            open={showLinkDialog}
            onOpenChange={setShowLinkDialog}
            goalId={goal.id}
            onInvestmentLinked={() => {
              fetchGoalDetail()
              fetchAvailableInvestments()
              setShowLinkDialog(false)
            }}
          />
        </>
      )}
    </div>
  )
}
