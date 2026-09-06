import React, { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api/client.js';

interface PaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  outstandingAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoiceId,
  invoiceNumber,
  outstandingAmount,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState<string>(outstandingAmount.toString());
  const [method, setMethod] = useState<string>('BANK_TRANSFER');
  const [reference, setReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/invoices/${invoiceId}/payments`, {
        amount: parseFloat(amount),
        method,
        reference
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to record payment');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-sm">Record Payment for {invoiceNumber}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Record</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-medium text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={outstandingAmount}
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Outstanding Balance: ${outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="BANK_TRANSFER">Bank Transfer (Wire/ACH)</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CHECK">Check</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. TXN-12345"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
