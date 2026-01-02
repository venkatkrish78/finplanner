'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

interface ParsedTransaction {
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  merchant: string | null;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
  source: string;
  selected?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function SMSInboxPage() {
  const [smsTexts, setSmsTexts] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ParsedTransaction>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleParse = async () => {
    if (!smsTexts.trim()) {
      toast.error('Please enter at least one SMS message');
      return;
    }

    setParsing(true);

    try {
      // Split SMS texts by newline or double newline
      const smsArray = smsTexts
        .split(/\n\n+/)
        .map(sms => sms.trim())
        .filter(sms => sms.length > 0);

      const response = await fetch('/api/ai/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsTexts: smsArray })
      });

      if (response.ok) {
        const data = await response.json();
        setParsedTransactions(data.transactions.map((t: ParsedTransaction) => ({...t, selected: true })));
        toast.success(`Parsed ${data.count} transaction(s) successfully`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to parse SMS messages');
      }
    } catch (error) {
      console.error('Error parsing SMS:', error);
      toast.error('Failed to parse SMS messages');
    } finally {
      setParsing(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setParsedTransactions(prev =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleSelectAll = () => {
    const allSelected = parsedTransactions.every(t => t.selected);
    setParsedTransactions(prev =>
      prev.map(t => ({ ...t, selected: !allSelected }))
    );
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm(parsedTransactions[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    setParsedTransactions(prev =>
      prev.map((t, i) => (i === editingIndex ? { ...t, ...editForm } : t))
    );
    setEditingIndex(null);
    setEditForm({});
    toast.success('Transaction updated');
  };

  const handleApproveSelected = async () => {
    const selectedTransactions = parsedTransactions.filter(t => t.selected);
    
    if (selectedTransactions.length === 0) {
      toast.error('Please select at least one transaction to approve');
      return;
    }

    setSubmitting(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Find or create category IDs
      const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

      for (const transaction of selectedTransactions) {
        try {
          // Find matching category or use default
          const categoryName = transaction.category.toLowerCase();
          let categoryId = categoryMap.get(categoryName);

          // If category not found, try to find "Other" or use first available
          if (!categoryId) {
            const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
            categoryId = otherCategory?.id || categories[0]?.id;
          }

          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: transaction.amount,
              type: transaction.type,
              description: transaction.description,
              merchant: transaction.merchant,
              date: transaction.date,
              source: 'SMS',
              rawMessage: transaction.rawText,
              categoryId: categoryId
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error('Error creating transaction:', error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} transaction(s) created successfully`);
        
        // Remove approved transactions from the list
        setParsedTransactions(prev => prev.filter(t => !t.selected));
        
        // Clear SMS input if all transactions were approved
        if (parsedTransactions.length === selectedTransactions.length) {
          setSmsTexts('');
        }
      }

      if (failCount > 0) {
        toast.error(`Failed to create ${failCount} transaction(s)`);
      }
    } catch (error) {
      console.error('Error approving transactions:', error);
      toast.error('Failed to approve transactions');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSelected = () => {
    const selectedCount = parsedTransactions.filter(t => t.selected).length;
    
    if (selectedCount === 0) {
      toast.error('Please select at least one transaction to reject');
      return;
    }

    setParsedTransactions(prev => prev.filter(t => !t.selected));
    toast.success(`Rejected ${selectedCount} transaction(s)`);
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 border-green-200">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Confidence</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Low Confidence</Badge>;
      default:
        return <Badge variant="secondary">{confidence}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SMS Transaction Parser
          </h1>
          <p className="text-muted-foreground">
            Paste your bank SMS messages to automatically extract and create transactions
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Messages
            </CardTitle>
            <CardDescription>
              Paste multiple SMS messages. Separate each message with a blank line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={smsTexts}
              onChange={(e) => setSmsTexts(e.target.value)}
              placeholder="Example:&#10;Debited Rs 500 from A/c XX1234 on 01-Jan-26 for GROCERY STORE&#10;&#10;Rs 1000 credited to A/c XX5678 on 02-Jan-26&#10;&#10;Dear customer, Rs 250 debited from your account on 03-Jan for UBER"
              rows={8}
              className="font-mono text-sm"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {smsTexts.split(/\n\n+/).filter(s => s.trim()).length} message(s) entered
              </p>
              <Button
                onClick={handleParse}
                disabled={parsing || !smsTexts.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {parsedTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parsed Transactions</CardTitle>
                  <CardDescription>
                    Review and approve transactions to add them to your account
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {parsedTransactions.every(t => t.selected) ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectSelected}
                    disabled={!parsedTransactions.some(t => t.selected)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApproveSelected}
                    disabled={submitting || !parsedTransactions.some(t => t.selected)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Selected
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parsedTransactions.map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-4 ${
                      transaction.selected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={transaction.selected}
                        onCheckedChange={() => handleToggleSelect(index)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-3">
                        {/* Transaction Details */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {transaction.type === 'INCOME' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-semibold text-lg">
                                {formatCurrency(transaction.amount)}
                              </span>
                              <Badge variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}>
                                {transaction.type}
                              </Badge>
                              {getConfidenceBadge(transaction.confidence)}
                            </div>
                            <p className="text-sm font-medium">{transaction.description}</p>
                            {transaction.merchant && (
                              <p className="text-sm text-muted-foreground">Merchant: {transaction.merchant}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Date: {new Date(transaction.date).toLocaleDateString()}</span>
                              <span>Category: {transaction.category}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Raw SMS Text (Collapsible) */}
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View raw SMS
                          </summary>
                          <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
                            {transaction.rawText}
                          </div>
                        </details>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={editingIndex !== null} onOpenChange={(open) => !open && setEditingIndex(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Modify the transaction details before approving
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={editForm.amount || 0}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(value) => setEditForm({ ...editForm, type: value as 'INCOME' | 'EXPENSE' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input
                  value={editForm.merchant || ''}
                  onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingIndex(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <AlertCircle className="h-5 w-5" />
              Tips for Best Results
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Paste bank SMS messages as-is from your messaging app</li>
              <li>Separate multiple messages with blank lines</li>
              <li>The AI will automatically detect transaction amounts, dates, and categories</li>
              <li>Review each transaction before approving to ensure accuracy</li>
              <li>Edit any details that need correction before approval</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
