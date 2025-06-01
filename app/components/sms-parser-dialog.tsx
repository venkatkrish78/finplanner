
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Mail,
  CreditCard,
  Calendar,
  Building,
  Hash
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  color: string
}

interface ParsedTransaction {
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description?: string
  merchant?: string
  accountNumber?: string
  transactionId?: string
  date: string
  balance?: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  platform?: string
  categoryId: string
  suggestedCategory: string
  rawMessage: string
}

interface SMSParserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionAdded: () => void
}

export function SMSParserDialog({ open, onOpenChange, onTransactionAdded }: SMSParserDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [messageText, setMessageText] = useState('')
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<'input' | 'review'>('input')
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchCategories()
      resetDialog()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const resetDialog = () => {
    setMessageText('')
    setParsedTransaction(null)
    setStep('input')
  }

  const handleParse = async () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter SMS or email text to parse",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/transactions/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: messageText.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setParsedTransaction(data)
        setStep('review')
      } else {
        const error = await response.json()
        toast({
          title: "Parsing Failed",
          description: error.error || "Could not parse the transaction from the provided text",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!parsedTransaction) return

    setSaving(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parsedTransaction.amount,
          type: parsedTransaction.type,
          description: parsedTransaction.description,
          merchant: parsedTransaction.merchant,
          categoryId: parsedTransaction.categoryId,
          accountNumber: parsedTransaction.accountNumber,
          transactionId: parsedTransaction.transactionId,
          date: parsedTransaction.date,
          balance: parsedTransaction.balance,
          status: parsedTransaction.status,
          source: messageText.toLowerCase().includes('@') ? 'EMAIL' : 'SMS',
          rawMessage: parsedTransaction.rawMessage
        }),
      })

      if (response.ok) {
        onTransactionAdded()
        onOpenChange(false)
      } else {
        throw new Error('Failed to save transaction')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    if (parsedTransaction) {
      const category = categories.find(c => c.id === categoryId)
      setParsedTransaction({
        ...parsedTransaction,
        categoryId,
        suggestedCategory: category?.name || 'Others'
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'bg-green-100 text-green-800'
      case 'EXPENSE':
        return 'bg-red-100 text-red-800'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const sampleMessages = [
    "HDFC Bank Alert: Rs. 500.00 debited from your A/c ending 1234 on 01-05-2025 14:30. Txn ID: 1234567890. Status: Success.",
    "PhonePe Alert: Rs. 250 debited from your bank account ending 4321 on 01-05-2025 14:30. Txn ID: 1122334455. Status: Success.",
    "INR 2000 debited from A/c no. XX3423 on 05-02-19 07:27:11 IST at ECS PAY. Avl Bal- INR 2343.23."
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
            Parse SMS/Email Transaction
          </DialogTitle>
          <DialogDescription>
            Paste your bank SMS or email text below to automatically extract transaction details.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="messageText">SMS/Email Text</Label>
              <Textarea
                id="messageText"
                placeholder="Paste your bank SMS or email text here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Sample Messages (click to use):</Label>
              <div className="space-y-2">
                {sampleMessages.map((sample, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setMessageText(sample)}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {sample}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Smartphone className="h-4 w-4" />
                <span>SMS</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <span>•</span>
              <span>Supports major Indian banks & UPI platforms</span>
            </div>
          </motion.div>
        )}

        {step === 'review' && parsedTransaction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Transaction Parsed Successfully</span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-lg font-semibold">
                        {formatCurrency(parsedTransaction.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge className={getTransactionTypeColor(parsedTransaction.type)}>
                      {parsedTransaction.type}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span>{formatDate(parsedTransaction.date)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {parsedTransaction.status}
                    </Badge>
                  </div>
                </div>

                {(parsedTransaction.merchant || parsedTransaction.description) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm">
                        {parsedTransaction.description || parsedTransaction.merchant}
                      </p>
                    </div>
                  </>
                )}

                {(parsedTransaction.accountNumber || parsedTransaction.transactionId || parsedTransaction.platform) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      {parsedTransaction.accountNumber && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Account</Label>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">****{parsedTransaction.accountNumber}</span>
                          </div>
                        </div>
                      )}

                      {parsedTransaction.transactionId && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Txn ID</Label>
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-mono">{parsedTransaction.transactionId}</span>
                          </div>
                        </div>
                      )}

                      {parsedTransaction.platform && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Platform</Label>
                          <Badge variant="outline">{parsedTransaction.platform}</Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={parsedTransaction.categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                            {category.name === parsedTransaction.suggestedCategory && (
                              <Badge variant="secondary" className="ml-2 text-xs">Suggested</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <DialogFooter>
          {step === 'input' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={loading || !messageText.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse Transaction
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('input')}
                disabled={saving}
              >
                Back
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Transaction
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
