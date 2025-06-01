
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download,
  BarChart3
} from 'lucide-react'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { SMSParserDialog } from '@/components/sms-parser-dialog'
import { TransactionViewSelector } from '@/components/transaction-view-selector'
import { TransactionSummaryCards } from '@/components/transaction-summary-cards'
import { TransactionCharts } from '@/components/transaction-charts'
import { TransactionFilters } from '@/components/transaction-filters'
import { EnhancedTransactionList } from '@/components/enhanced-transaction-list'
import { Category } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function TransactionsPage() {
  // View state
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false)
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleTransactionUpdated = () => {
    setRefreshKey(prev => prev + 1)
    toast({
      title: "Success",
      description: "Transaction updated successfully",
    })
  }

  const handleTransactionDeleted = () => {
    setRefreshKey(prev => prev + 1)
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    })
  }

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()
      if (view === 'monthly' && month) {
        params.append('year', year.toString())
        params.append('month', month.toString())
      } else {
        params.append('year', year.toString())
      }
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (searchTerm) params.append('search', searchTerm)
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString())

      const response = await fetch(`/api/transactions/export?${params}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const periodLabel = view === 'monthly' && month 
        ? `${year}-${month.toString().padStart(2, '0')}` 
        : year.toString()
      a.download = `transactions-${periodLabel}.csv`
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

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedType('all')
    setDateRange({})
    setSortBy('date')
    setSortOrder('desc')
  }

  const handleViewChange = (newView: 'monthly' | 'yearly') => {
    setView(newView)
    // Clear date range when switching views
    setDateRange({})
  }

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
              Transaction Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Comprehensive view of your financial transactions with insights and analytics
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

        {/* View Selector */}
        <TransactionViewSelector
          view={view}
          onViewChange={handleViewChange}
          year={year}
          onYearChange={setYear}
          month={view === 'monthly' ? month : undefined}
          onMonthChange={setMonth}
        />

        {/* Summary Cards */}
        <TransactionSummaryCards
          year={year}
          month={view === 'monthly' ? month : undefined}
          view={view}
          refreshTrigger={refreshKey}
          key={`${view}-${year}-${month}`}
        />

        {/* Charts */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Financial Insights
            </h2>
          </div>
          <TransactionCharts
            year={year}
            month={view === 'monthly' ? month : undefined}
            refreshTrigger={refreshKey}
            key={`charts-${view}-${year}-${month}`}
          />
        </div>

        {/* Filters */}
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          categories={categories}
          onClearFilters={handleClearFilters}
        />

        {/* Enhanced Transaction List */}
        <EnhancedTransactionList
          year={year}
          month={view === 'monthly' ? month : undefined}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          dateRange={dateRange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onAddTransaction={() => setIsAddDialogOpen(true)}
          onTransactionUpdated={handleTransactionUpdated}
          onTransactionDeleted={handleTransactionDeleted}
          key={`list-${view}-${year}-${month}-${searchTerm}-${selectedCategory}-${selectedType}-${sortBy}-${sortOrder}-${refreshKey}`}
        />
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
