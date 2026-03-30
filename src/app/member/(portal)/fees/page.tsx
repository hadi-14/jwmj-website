'use client';

import { useState, useEffect } from 'react';
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  Check,
  FileText,
  CreditCard
} from 'lucide-react';

interface FeeData {
  summary: {
    totalDue: number;
    totalPaid: number;
    totalDiscount: number;
    balance: number;
    status: string;
  };
  yearlyBreakdown: Array<{
    fiscalYear: string;
    feeAmount: number;
    paidAmount: number;
    balance: number;
    status: string;
  }>;
  annualFees: Array<{
    invoiceNo: string;
    invoiceDate: string;
    fiscalYear: string;
    amount: number;
    details: string;
  }>;
  payments: Array<{
    voucherNo: string;
    receiveDate: string;
    amount: number;
    discount: number;
  }>;
}

export default function FeesPage() {
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = { CreditCard }; // Remove unused import lint errors

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      const response = await fetch('/api/member/fees');
      if (response.ok) {
        const data = await response.json();
        setFeeData(data);
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading fee status...</p>
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center">
          <Receipt className="w-8 h-8 text-foreground-200" />
        </div>
        <p className="text-foreground-400 font-semibold">Unable to load fee information</p>
        <button
          onClick={fetchFeeData}
          className="px-5 py-2.5 bg-primary-blue text-primary-white text-sm font-bold rounded-full hover:bg-primary-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const paidPct = Math.round((feeData.summary.totalPaid / feeData.summary.totalDue) * 100) || 0;



  const tabs = [
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payments' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fee Status</h1>
        <p className="text-foreground-300 mt-1">Your annual fee breakdown and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Due */}
        <div className="bg-primary-blue-50/50 rounded-xl border-2 border-primary-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-blue" />
            </div>
            <TrendingUp className="w-4 h-4 text-primary-blue" />
          </div>
          <p className="text-xs font-bold text-primary-blue-600 uppercase tracking-widest mb-1">Total Due</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-blue">
            PKR {feeData.summary.totalDue.toLocaleString()}
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-primary-green-50/50 rounded-xl border-2 border-primary-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-primary-green" />
            </div>
            <span className="text-xs font-bold text-primary-green">{paidPct}%</span>
          </div>
          <p className="text-xs font-bold text-primary-green-600 uppercase tracking-widest mb-1">Total Paid</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-green">
            PKR {feeData.summary.totalPaid.toLocaleString()}
          </p>
        </div>

        {/* Discount */}
        <div className="bg-accent-navy-50 rounded-xl border-2 border-accent-navy-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-navy-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-accent-navy" />
            </div>
          </div>
          <p className="text-xs font-bold text-accent-navy-400 uppercase tracking-widest mb-1">Discount</p>
          <p className="text-xl sm:text-2xl font-bold text-accent-navy">
            PKR {feeData.summary.totalDiscount.toLocaleString()}
          </p>
        </div>

        {/* Balance */}
        <div className={`rounded-xl border-2 p-4 ${feeData.summary.balance > 0
          ? 'bg-red-50 border-red-200'
          : 'bg-primary-silver-100 border-primary-silver-400'
          }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feeData.summary.balance > 0 ? 'bg-red-100' : 'bg-primary-silver-200'
              }`}>
              <TrendingDown className={`w-5 h-5 ${feeData.summary.balance > 0 ? 'text-red-600' : 'text-foreground-300'
                }`} />
            </div>
          </div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${feeData.summary.balance > 0 ? 'text-red-500' : 'text-foreground-300'
            }`}>Balance Remaining</p>
          <p className={`text-xl sm:text-2xl font-bold ${feeData.summary.balance > 0 ? 'text-red-600' : 'text-foreground-400'
            }`}>
            PKR {feeData.summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">Payment Progress</span>
          <span className="text-sm font-bold text-primary-blue">{paidPct}% Complete</span>
        </div>
        <div className="h-3 bg-primary-silver-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-blue to-primary-green transition-all duration-500"
            style={{ width: `${paidPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-foreground-300">
          <span>PKR 0</span>
          <span>PKR {feeData.summary.totalDue.toLocaleString()}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-primary-silver-200 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-foreground-400 hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-background rounded-2xl border-2 border-primary-silver-400 overflow-hidden">
        {activeTab === 'invoices' && (
          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Annual Fee Invoices</h2>
            {feeData.annualFees?.length > 0 ? (
              <div className="space-y-3">
                {feeData.annualFees.map((fee) => (
                  <div key={fee.invoiceNo} className="flex items-center justify-between p-4 border-2 border-primary-silver-400 rounded-xl hover:bg-primary-silver-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-blue" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">FY {fee.fiscalYear}</p>
                        <p className="text-xs text-foreground-300">
                          Invoice: {fee.invoiceNo} | {new Date(fee.invoiceDate).toLocaleDateString()}
                        </p>
                        {fee.details && (
                          <p className="text-xs text-foreground-400 mt-1">{fee.details}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-foreground shrink-0">PKR {fee.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground-300">No invoices found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Payment History</h2>
            {feeData.payments?.length > 0 ? (
              <div className="space-y-3">
                {feeData.payments.map((payment) => (
                  <div key={payment.voucherNo} className="flex items-center justify-between p-4 border-l-4 border-l-primary-green border-2 border-primary-silver-400 rounded-xl hover:bg-primary-silver-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-green-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary-green" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-primary-green" />
                          <p className="font-bold text-foreground">Payment Received</p>
                        </div>
                        <p className="text-xs text-foreground-300">
                          Voucher: {payment.voucherNo} | {new Date(payment.receiveDate).toLocaleDateString()}
                        </p>
                        {payment.discount > 0 && (
                          <p className="text-xs font-semibold text-primary-green mt-1">
                            Discount: PKR {payment.discount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary-green">PKR {payment.amount.toLocaleString()}</p>
                      <span className="text-xs font-bold bg-primary-green-100 text-primary-green px-2 py-0.5 rounded-full">
                        PAID
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-foreground-300">No payment history found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
