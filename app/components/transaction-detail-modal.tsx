'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Building2,
  Hash,
  FileText,
  Clock,
  MapPin,
  Tag
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  description: string
  date: string | Date
  type: 'INCOME' | 'EXPENSE'
  category?: {
    id: string
    name: string
    color?: string
  }
  account?: {
    id: string
    name: string
    type: string
  }
  merchant?: string
  location?: string
  notes?: string
  tags?: string[]
  reference?: string
}

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transactionId: string) => void
}

// Client-safe time formatting
function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: TransactionDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!transaction) return null

  const isIncome = transaction.type === 'INCOME'
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600'
  const amountPrefix = isIncome ? '+' : '-'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Amount and Type */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${amountColor}`}>
                    {amountPrefix}₹{Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <Badge 
                    variant={isIncome ? "default" : "destructive"}
                    className="mt-2"
                  >
                    {transaction.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Description</div>
                    <div className="text-gray-600">{transaction.description}</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-gray-600">
                      {mounted ? formatDate(transaction.date) : 'Loading...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div className="text-gray-600">
                      {mounted ? formatTime(transaction.date) : '--:--'}
                    </div>
                  </div>
                </div>

                {transaction.category && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Category</div>
                        <Badge 
                          style={{ 
                            backgroundColor: transaction.category.color || '#gray',
                            color: 'white'
                          }}
                        >
                          {transaction.category.name}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}

                {transaction.account && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Account</div>
                        <div className="text-gray-600">
                          {transaction.account.name} ({transaction.account.type})
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            {(transaction.merchant || transaction.location || transaction.reference || transaction.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transaction.merchant && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Merchant</div>
                        <div className="text-gray-600">{transaction.merchant}</div>
                      </div>
                    </div>
                  )}

                  {transaction.location && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Location</div>
                          <div className="text-gray-600">{transaction.location}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {transaction.reference && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Reference</div>
                          <div className="text-gray-600">{transaction.reference}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {transaction.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium">Notes</div>
                          <div className="text-gray-600 whitespace-pre-wrap">
                            {transaction.notes}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {transaction.tags && transaction.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {transaction.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(transaction)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(transaction.id)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
