
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  Plus, 
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Transaction, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import TransactionDetailModal from './transaction-detail-modal';
import { AddTransactionDialog } from './add-transaction-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EnhancedTransactionListProps {
  year: number;
  month?: number;
  searchTerm: string;
  selectedCategory: string;
  selectedType: string;
  dateRange: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onAddTransaction: () => void;
  onTransactionUpdated?: () => void;
  onTransactionDeleted?: () => void;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function EnhancedTransactionList({
  year,
  month,
  searchTerm,
  selectedCategory,
  selectedType,
  dateRange,
  sortBy,
  sortOrder,
  onAddTransaction,
  onTransactionUpdated,
  onTransactionDeleted
}: EnhancedTransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [year, month, searchTerm, selectedCategory, selectedType, dateRange, sortBy, sortOrder, pagination.page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      });

      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString());
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString());

      const response = await fetch(`/api/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        console.error('Failed to fetch transactions:', response.status);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
        fetchTransactions();
        // Trigger parent callback for chart refresh
        onTransactionDeleted?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleTransactionUpdated = () => {
    fetchTransactions();
    setSelectedTransaction(null);
    // Trigger parent callback for chart refresh
    onTransactionUpdated?.();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownRight className="h-4 w-4 text-emerald-600" />;
      case 'EXPENSE':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-professional-blue" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-emerald-600';
      case 'EXPENSE':
        return 'text-red-600';
      default:
        return 'text-professional-blue';
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const amount = formatCurrency(transaction.amount);
    return transaction.type === 'INCOME' ? `+${amount}` : `-${amount}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && pagination.page === 1) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="professional-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-professional-blue" />
            Transactions ({pagination.total.toLocaleString()})
          </CardTitle>
          {loading && pagination.page > 1 && (
            <Loader2 className="h-4 w-4 animate-spin text-professional-blue" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No transactions found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || dateRange.from || dateRange.to
                    ? 'Try adjusting your filters to see more results'
                    : 'Start by adding your first transaction'
                  }
                </p>
                <Button
                  onClick={onAddTransaction}
                  className="bg-professional-blue hover:bg-professional-blue-dark text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={`${transaction.id}-${pagination.page}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 hover-shadow cursor-pointer"
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white transition-colors">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">
                                  {transaction.description || 'No description'}
                                </h3>
                                <div className="flex items-center space-x-3 mt-1">
                                  {transaction.merchant && (
                                    <span className="text-sm text-slate-600 truncate">
                                      {transaction.merchant}
                                    </span>
                                  )}
                                  {transaction.category && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-1"
                                      style={{ 
                                        backgroundColor: transaction.category.color + '20', 
                                        color: transaction.category.color,
                                        border: `1px solid ${transaction.category.color}30`
                                      }}
                                    >
                                      {transaction.category.name}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(transaction.date)}
                                  </span>
                                  <span>{formatTime(transaction.date)}</span>
                                  {transaction.transactionId && (
                                    <span className="font-mono">
                                      ID: {transaction.transactionId.slice(-6)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                              {getAmountDisplay(transaction)}
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-1">
                              <Badge 
                                variant={transaction.status === 'SUCCESS' ? 'default' : 'destructive'}
                                className={`text-xs ${
                                  transaction.status === 'SUCCESS' 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }`}
                              >
                                {transaction.status}
                              </Badge>
                              {transaction.source !== 'MANUAL' && (
                                <Badge variant="outline" className="text-xs">
                                  {transaction.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTransactionClick(transaction);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTransaction(transaction);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Transaction
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTransaction(transaction);
                                }}
                                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Transaction
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total.toLocaleString()} transactions
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum: number;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                              variant={pagination.page === pageNum ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${
                                pagination.page === pageNum 
                                  ? 'bg-professional-blue text-white' 
                                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages || loading}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        transactionId={selectedTransaction?.id || null}
        onTransactionUpdated={handleTransactionUpdated}
      />

      {/* Edit Transaction Dialog */}
      <AddTransactionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTransactionAdded={handleTransactionUpdated}
        editingTransaction={selectedTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone and will remove the transaction from all reports and calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-red-600 hover:bg-red-700">
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
