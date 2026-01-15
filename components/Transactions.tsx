
import React, { useState } from 'react';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Download, 
  Plus
} from 'lucide-react';
import { Transaction, Invoice, TransactionType, TransactionSource } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

interface TransactionsProps {
  transactions: Transaction[];
  invoices: Invoice[];
  onAdd: (tx: Transaction) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, invoices, onAdd }) => {
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Transactions</h2>
          <p className="text-[#A0A0A0]">Complete history of all cash inflow and outflow.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#151515] border border-[#2A2A2A] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-[#1E1E1E] transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all">
            <Plus className="w-4 h-4" /> Manual Record
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#151515] border border-[#2A2A2A] rounded-lg px-4 py-2.5">
        <Search className="w-4 h-4 text-[#666666]" />
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#666666]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1E1E1E] text-[#A0A0A0] uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-[#1E1E1E] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tx.type === TransactionType.PAYMENT ? (
                        <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-white font-medium">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#A0A0A0]">{tx.description}</td>
                  <td className={`px-6 py-4 font-bold ${tx.type === TransactionType.PAYMENT ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.type === TransactionType.PAYMENT ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.source === TransactionSource.STRIPE ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {tx.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-500 hover:underline cursor-pointer">
                    {invoices.find(i => i.id === tx.invoiceId)?.invoiceNumber || '—'}
                  </td>
                  <td className="px-6 py-4 text-[#666666]">{formatDate(tx.transactedAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center">
                        <ArrowDownCircle className="w-6 h-6 text-[#666666]" />
                      </div>
                      <p className="text-[#A0A0A0]">No transactions found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
