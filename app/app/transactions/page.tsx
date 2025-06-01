
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { SMSParserDialog } from '@/components/sms-parser-dialog'
import { Transaction, Category } from '@/lib/types'
import { formatCurrency } from '@/lib/currency'
import { useToast } from '@/hooks/use-toast'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [refreshKey])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', response.status)
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to fetch categories:', response.status)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1)
    setIsAddDialogOpen(false)
    setIsSMSDialogOpen(false)
    toast({
      title: "Success",
      description: "Transaction added successfully",
    })
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/transactions/export')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Transactions exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export transactions",
        variant: "destructive",
      })
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory
    const matchesType = selectedType === 'all' || transaction.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownRight className="h-4 w-4 text-emerald-600" />
      case 'EXPENSE':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      default:
        return <CreditCard className="h-4 w-4 text-professional-blue" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-emerald-600'
      case 'EXPENSE':
        return 'text-red-600'
      default:
        return 'text-professional-blue'
    }
  }

  const getAmountDisplay = (transaction: Transaction) => {
    const amount = formatCurrency(transaction.amount)
    return transaction.type === 'INCOME' ? `+${amount}` : `-${amount}`
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

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpenses

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-professional-blue to-professional-blue-light rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              Transaction History
            </h1>
            <p className="text-slate-600 mt-1">
              View and manage all your financial transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-professional-blue hover:bg-professional-blue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              onClick={() => setIsSMSDialogOpen(true)}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Search className="h-4 w-4 mr-2" />
              Parse SMS
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="professional-card hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Income
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Expenses
              </CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Net Balance
              </CardTitle>
              <div className={`p-2 rounded-lg ${netBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <CreditCard className={`h-4 w-4 ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(netBalance))}
              </div>
            </CardContent>
          </Card>

          <Card className="professional-card hover-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Transactions
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-4 w-4 text-professional-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-professional-blue">
                {transactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="professional-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full form-input"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] form-input">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px] form-input">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="text-slate-900">Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions found</h3>
                  <p className="text-slate-600 mb-4">
                    {searchTerm || selectedCategory !== 'all' || selectedType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start by adding your first transaction'
                    }
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-professional-blue hover:bg-professional-blue-dark text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors hover-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-slate-100">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {transaction.description || 'No description'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          {transaction.merchant && (
                            <span>{transaction.merchant}</span>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: transaction.category?.color + '20', color: transaction.category?.color }}
                          >
                            {transaction.category?.name}
                          </Badge>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                        {getAmountDisplay(transaction)}
                      </div>
                      <Badge 
                        variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'}
                        className={transaction.status === 'SUCCESS' ? 'status-success' : 'status-failed'}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTransactionAdded={handleTransactionAdded}
      />
      
      <SMSParserDialog
        open={isSMSDialogOpen}
        onOpenChange={setIsSMSDialogOpen}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  )
}
