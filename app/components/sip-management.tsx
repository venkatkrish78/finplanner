
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Pause, Square, Calendar, TrendingUp } from 'lucide-react'
import { Investment, SIP, SIPStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import AddSIPDialog from '@/components/add-sip-dialog'
import { motion } from 'framer-motion'

interface SIPManagementProps {
  investments: Investment[]
}

const statusColors: Record<SIPStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusIcons: Record<SIPStatus, React.ReactNode> = {
  ACTIVE: <Play className="h-3 w-3" />,
  PAUSED: <Pause className="h-3 w-3" />,
  COMPLETED: <Square className="h-3 w-3" />,
  CANCELLED: <Square className="h-3 w-3" />
}

export default function SIPManagement({ investments }: SIPManagementProps) {
  const [sips, setSips] = useState<SIP[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSIPs()
  }, [])

  const fetchSIPs = async () => {
    try {
      const response = await fetch('/api/investments/sips')
      if (response.ok) {
        const data = await response.json()
        setSips(data)
      }
    } catch (error) {
      console.error('Error fetching SIPs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSIPAdded = () => {
    fetchSIPs()
    setIsAddDialogOpen(false)
  }

  const handleStatusChange = async (sipId: string, newStatus: SIPStatus) => {
    try {
      const response = await fetch(`/api/investments/sips/${sipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchSIPs()
      }
    } catch (error) {
      console.error('Error updating SIP status:', error)
    }
  }

  const getNextInstallmentDate = (sip: SIP) => {
    return new Date(sip.nextDate).toLocaleDateString('en-IN')
  }

  const calculateTotalInvested = (sip: SIP) => {
    return sip.installmentsPaid * sip.amount
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  const activeSIPs = sips.filter(sip => sip.status === 'ACTIVE')
  const totalMonthlySIP = activeSIPs.reduce((sum, sip) => {
    if (sip.frequency === 'MONTHLY') return sum + sip.amount
    if (sip.frequency === 'QUARTERLY') return sum + (sip.amount / 3)
    if (sip.frequency === 'YEARLY') return sum + (sip.amount / 12)
    if (sip.frequency === 'WEEKLY') return sum + (sip.amount * 4.33)
    return sum
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">SIP Management</h2>
          <p className="text-gray-600">Manage your Systematic Investment Plans</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add SIP
        </Button>
      </div>

      {/* SIP Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active SIPs</p>
                  <p className="text-xl font-bold text-blue-600">{activeSIPs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly SIP Amount</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalMonthlySIP)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total SIPs</p>
                  <p className="text-xl font-bold text-purple-600">{sips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SIP List */}
      {sips.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sips.map((sip, index) => (
            <motion.div
              key={sip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {sip.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {sip.investment.name} • {sip.investment.assetClass.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={statusColors[sip.status]}>
                      <div className="flex items-center gap-1">
                        {statusIcons[sip.status]}
                        {sip.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">SIP Amount</p>
                        <p className="font-semibold">{formatCurrency(sip.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Frequency</p>
                        <p className="font-semibold">{sip.frequency}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Installments Paid</p>
                        <p className="font-semibold">
                          {sip.installmentsPaid}
                          {sip.totalInstallments && ` / ${sip.totalInstallments}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Invested</p>
                        <p className="font-semibold">{formatCurrency(calculateTotalInvested(sip))}</p>
                      </div>
                    </div>

                    {sip.status === 'ACTIVE' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Next installment: {getNextInstallmentDate(sip)}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {sip.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(sip.id, 'PAUSED' as SIPStatus)}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      {sip.status === 'PAUSED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(sip.id, 'ACTIVE' as SIPStatus)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      {(sip.status === 'ACTIVE' || sip.status === 'PAUSED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusChange(sip.id, 'CANCELLED' as SIPStatus)}
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No SIPs yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Set up systematic investment plans to automate your investments
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First SIP
            </Button>
          </CardContent>
        </Card>
      )}

      <AddSIPDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSIPAdded={handleSIPAdded}
        investments={investments}
      />
    </div>
  )
}
