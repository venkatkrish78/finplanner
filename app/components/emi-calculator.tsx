
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, CreditCard, Calendar, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency';
import { EMICalculation } from '@/lib/types';

export function EMICalculator() {
  const [calculation, setCalculation] = useState<EMICalculation | null>(null);
  const [loading, setLoading] = useState(false);

  // EMI Calculator
  const [emiForm, setEmiForm] = useState({
    principal: '',
    interestRate: '',
    tenure: ''
  });

  // Loan Comparison
  const [comparisonForm, setComparisonForm] = useState({
    principal: '',
    option1Rate: '',
    option1Tenure: '',
    option2Rate: '',
    option2Tenure: ''
  });

  const [comparisonResult, setComparisonResult] = useState<{
    option1: EMICalculation;
    option2: EMICalculation;
  } | null>(null);

  const calculateEMI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/loans/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emiForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data);
      }
    } catch (error) {
      console.error('Error calculating EMI:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareLoans = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [response1, response2] = await Promise.all([
        fetch('/api/loans/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            principal: comparisonForm.principal,
            interestRate: comparisonForm.option1Rate,
            tenure: comparisonForm.option1Tenure
          })
        }),
        fetch('/api/loans/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            principal: comparisonForm.principal,
            interestRate: comparisonForm.option2Rate,
            tenure: comparisonForm.option2Tenure
          })
        })
      ]);

      if (response1.ok && response2.ok) {
        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);
        setComparisonResult({
          option1: data1,
          option2: data2
        });
      }
    } catch (error) {
      console.error('Error comparing loans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            EMI & Loan Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="emi" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
              <TabsTrigger value="compare">Loan Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="emi" className="space-y-6">
              <form onSubmit={calculateEMI} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Loan Amount (₹)</Label>
                    <Input
                      id="principal"
                      type="number"
                      value={emiForm.principal}
                      onChange={(e) => setEmiForm({ ...emiForm, principal: e.target.value })}
                      placeholder="1000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      value={emiForm.interestRate}
                      onChange={(e) => setEmiForm({ ...emiForm, interestRate: e.target.value })}
                      placeholder="8.5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (months)</Label>
                    <Input
                      id="tenure"
                      type="number"
                      value={emiForm.tenure}
                      onChange={(e) => setEmiForm({ ...emiForm, tenure: e.target.value })}
                      placeholder="240"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Calculating...' : 'Calculate EMI'}
                </Button>
              </form>

              {/* EMI Results */}
              {calculation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly EMI
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(calculation.emi)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Per month</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          Total Amount
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                          {formatCurrency(calculation.totalAmount)}
                        </div>
                        <p className="text-xs text-green-600 mt-1">Total payable</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Total Interest
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-900">
                          {formatCurrency(calculation.totalInterest)}
                        </div>
                        <p className="text-xs text-red-600 mt-1">Interest payable</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Amortization Schedule Preview */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Amortization Schedule (First 12 months)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Month</th>
                              <th className="text-right p-2">EMI</th>
                              <th className="text-right p-2">Principal</th>
                              <th className="text-right p-2">Interest</th>
                              <th className="text-right p-2">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculation.schedule.slice(0, 12).map((row) => (
                              <tr key={row.month} className="border-b">
                                <td className="p-2">{row.month}</td>
                                <td className="text-right p-2">{formatCurrency(row.emi)}</td>
                                <td className="text-right p-2 text-green-600">{formatCurrency(row.principal)}</td>
                                <td className="text-right p-2 text-red-600">{formatCurrency(row.interest)}</td>
                                <td className="text-right p-2">{formatCurrency(row.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-6">
              <form onSubmit={compareLoans} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comparisonPrincipal">Loan Amount (₹)</Label>
                  <Input
                    id="comparisonPrincipal"
                    type="number"
                    value={comparisonForm.principal}
                    onChange={(e) => setComparisonForm({ ...comparisonForm, principal: e.target.value })}
                    placeholder="1000000"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900">Option 1</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="option1Rate">Interest Rate (%)</Label>
                        <Input
                          id="option1Rate"
                          type="number"
                          step="0.01"
                          value={comparisonForm.option1Rate}
                          onChange={(e) => setComparisonForm({ ...comparisonForm, option1Rate: e.target.value })}
                          placeholder="8.5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="option1Tenure">Tenure (months)</Label>
                        <Input
                          id="option1Tenure"
                          type="number"
                          value={comparisonForm.option1Tenure}
                          onChange={(e) => setComparisonForm({ ...comparisonForm, option1Tenure: e.target.value })}
                          placeholder="240"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900">Option 2</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="option2Rate">Interest Rate (%)</Label>
                        <Input
                          id="option2Rate"
                          type="number"
                          step="0.01"
                          value={comparisonForm.option2Rate}
                          onChange={(e) => setComparisonForm({ ...comparisonForm, option2Rate: e.target.value })}
                          placeholder="9.0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="option2Tenure">Tenure (months)</Label>
                        <Input
                          id="option2Tenure"
                          type="number"
                          value={comparisonForm.option2Tenure}
                          onChange={(e) => setComparisonForm({ ...comparisonForm, option2Tenure: e.target.value })}
                          placeholder="180"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Comparing...' : 'Compare Loans'}
                </Button>
              </form>

              {/* Comparison Results */}
              {comparisonResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-blue-900">Option 1</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600">Monthly EMI</p>
                          <p className="font-bold text-blue-900">{formatCurrency(comparisonResult.option1.emi)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Total Amount</p>
                          <p className="font-bold text-blue-900">{formatCurrency(comparisonResult.option1.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Total Interest</p>
                          <p className="font-bold text-blue-900">{formatCurrency(comparisonResult.option1.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Tenure</p>
                          <p className="font-bold text-blue-900">{comparisonForm.option1Tenure} months</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-green-900">Option 2</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-600">Monthly EMI</p>
                          <p className="font-bold text-green-900">{formatCurrency(comparisonResult.option2.emi)}</p>
                        </div>
                        <div>
                          <p className="text-green-600">Total Amount</p>
                          <p className="font-bold text-green-900">{formatCurrency(comparisonResult.option2.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-green-600">Total Interest</p>
                          <p className="font-bold text-green-900">{formatCurrency(comparisonResult.option2.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-green-600">Tenure</p>
                          <p className="font-bold text-green-900">{comparisonForm.option2Tenure} months</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendation */}
                  <Card className="md:col-span-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-orange-800">💡 Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {comparisonResult.option1.totalInterest < comparisonResult.option2.totalInterest ? (
                        <p className="text-orange-700">
                          <strong>Option 1</strong> is better as it saves you{' '}
                          <strong>{formatCurrency(comparisonResult.option2.totalInterest - comparisonResult.option1.totalInterest)}</strong>{' '}
                          in total interest, despite having a {comparisonResult.option1.emi > comparisonResult.option2.emi ? 'higher' : 'lower'} monthly EMI.
                        </p>
                      ) : (
                        <p className="text-orange-700">
                          <strong>Option 2</strong> is better as it saves you{' '}
                          <strong>{formatCurrency(comparisonResult.option1.totalInterest - comparisonResult.option2.totalInterest)}</strong>{' '}
                          in total interest, despite having a {comparisonResult.option2.emi > comparisonResult.option1.emi ? 'higher' : 'lower'} monthly EMI.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-indigo-800">💡 Loan Planning Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Lower Interest Rate</h4>
              <p className="text-indigo-600">Even a 0.5% difference in interest rate can save lakhs over the loan tenure.</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Shorter Tenure</h4>
              <p className="text-indigo-600">Shorter tenure means higher EMI but significantly lower total interest.</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Prepayments</h4>
              <p className="text-indigo-600">Use bonuses and windfalls to make prepayments and reduce interest burden.</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">EMI vs Income</h4>
              <p className="text-indigo-600">Keep total EMIs under 40% of your monthly income for financial stability.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
