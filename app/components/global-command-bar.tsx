'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Command, 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/currency'

interface ParsedCommand {
  type: 'transaction' | 'renewal' | 'unknown'
  confidence: 'high' | 'medium' | 'low'
  data: {
    // Transaction fields
    amount?: number
    description?: string
    merchant?: string
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    date?: string
    categoryId?: string
    suggestedCategory?: string
    
    // Renewal/Bill fields
    name?: string
    provider?: string
    policyNumber?: string
    frequency?: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'
    nextDueDate?: string
  }
  originalInput: string
  reasoning?: string
}

interface Category {
  id: string
  name: string
  color: string
}

export function GlobalCommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      fetchCategories()
      // Focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Reset state when closing
      setInput('')
      setParsedCommand(null)
      setSelectedCategoryId('')
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

  const handleParse = async () => {
    if (!input.trim()) {
      toast.error('Please enter a command')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to parse command')
      }

      const parsed: ParsedCommand = await response.json()
      setParsedCommand(parsed)

      // Auto-select category if suggested
      if (parsed.data.suggestedCategory) {
        const category = categories.find(c => 
          c.name.toLowerCase() === parsed.data.suggestedCategory?.toLowerCase()
        )
        if (category) {
          setSelectedCategoryId(category.id)
        }
      }

      // If high confidence, we can show a quick confirmation
      if (parsed.confidence === 'high' && parsed.type !== 'unknown') {
        // Show parsed data for confirmation
      } else if (parsed.confidence === 'low' || parsed.type === 'unknown') {
        toast.error('Could not understand the command. Please try again or use manual entry.')
        setParsedCommand(null)
      }
    } catch (error) {
      console.error('Error parsing command:', error)
      toast.error('Failed to parse command. Please try again.')
      setParsedCommand(null)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAndCreate = async () => {
    if (!parsedCommand || !selectedCategoryId) {
      toast.error('Please select a category')
      return
    }

    setLoading(true)

    try {
      if (parsedCommand.type === 'transaction') {
        // Create transaction
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parsedCommand.data.amount,
            type: parsedCommand.data.type,
            description: parsedCommand.data.description,
            merchant: parsedCommand.data.merchant,
            date: parsedCommand.data.date || new Date().toISOString(),
            categoryId: selectedCategoryId,
            source: 'MANUAL'
          })
        })

        if (!response.ok) throw new Error('Failed to create transaction')

        toast.success('Transaction created successfully!')
        setOpen(false)
      } else if (parsedCommand.type === 'renewal') {
        // Create bill/renewal
        const response = await fetch('/api/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: parsedCommand.data.name,
            amount: parsedCommand.data.amount,
            frequency: parsedCommand.data.frequency || 'MONTHLY',
            description: parsedCommand.data.description,
            provider: parsedCommand.data.provider,
            policyNumber: parsedCommand.data.policyNumber,
            categoryId: selectedCategoryId,
            nextDueDate: parsedCommand.data.nextDueDate || new Date().toISOString()
          })
        })

        if (!response.ok) throw new Error('Failed to create renewal')

        toast.success('Renewal created successfully!')
        setOpen(false)
      }
    } catch (error) {
      console.error('Error creating entry:', error)
      toast.error('Failed to create entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          title="Quick Add (Cmd/Ctrl + K)"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Command Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Quick Add with AI
            </DialogTitle>
            <DialogDescription>
              Type naturally to add transactions or renewals. Press Cmd/Ctrl + K anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Examples */}
            {!parsedCommand && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-slate-700">Examples:</p>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Spent ₹500 groceries cash</Badge>
                  <Badge variant="outline" className="text-xs ml-2">Paid medical insurance ₹28011 today policy 3073</Badge>
                  <Badge variant="outline" className="text-xs">Add renewal LIC due 19 Mar yearly ₹6527</Badge>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <Label htmlFor="command-input">Your command</Label>
              <div className="flex gap-2">
                <Input
                  id="command-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleParse()
                    }
                  }}
                  placeholder="e.g., Spent ₹1000 on groceries"
                  className="flex-1"
                  disabled={loading || !!parsedCommand}
                />
                {!parsedCommand && (
                  <Button
                    onClick={handleParse}
                    disabled={loading || !input.trim()}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Command className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Parsed Result */}
            <AnimatePresence>
              {parsedCommand && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {parsedCommand.confidence === 'high' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {parsedCommand.type === 'transaction' ? 'Transaction' : 'Renewal'}
                          </p>
                          <p className="text-sm text-slate-600">
                            Confidence: {parsedCommand.confidence}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setParsedCommand(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display parsed data */}
                    <div className="space-y-2">
                      {parsedCommand.data.amount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Amount:</span>
                          <span className="font-semibold">
                            {formatCurrency(parsedCommand.data.amount)}
                          </span>
                        </div>
                      )}

                      {parsedCommand.data.description && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Description:</span>
                          <span className="font-medium">{parsedCommand.data.description}</span>
                        </div>
                      )}

                      {parsedCommand.data.name && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Name:</span>
                          <span className="font-medium">{parsedCommand.data.name}</span>
                        </div>
                      )}

                      {parsedCommand.data.provider && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Provider:</span>
                          <span className="font-medium">{parsedCommand.data.provider}</span>
                        </div>
                      )}

                      {parsedCommand.data.frequency && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Frequency:</span>
                          <Badge>{parsedCommand.data.frequency}</Badge>
                        </div>
                      )}

                      {parsedCommand.data.type && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Type:</span>
                          <Badge>{parsedCommand.data.type}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Category selection */}
                    <div className="space-y-2">
                      <Label htmlFor="category-select">Category *</Label>
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger id="category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {parsedCommand.reasoning && (
                      <p className="text-xs text-slate-500 italic">
                        {parsedCommand.reasoning}
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            {parsedCommand && (
              <>
                <Button variant="outline" onClick={() => setParsedCommand(null)}>
                  Edit
                </Button>
                <Button
                  onClick={handleConfirmAndCreate}
                  disabled={loading || !selectedCategoryId}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
