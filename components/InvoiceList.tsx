
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Printer, 
  Trash2, 
  CheckCircle,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Invoice, Customer, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { StatusBadge } from './Dashboard';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  onAdd: () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, customers, onAdd, onUpdateStatus }) => {
  const [filter, setFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
      (customer?.firstName.toLowerCase().includes(search.toLowerCase()) || customer?.lastName.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'ALL' || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-[#A0A0A0]">Manage your billing and payment history.</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input 
            type="text" 
            placeholder="Search by invoice # or customer..." 
            className="w-full bg-[#151515] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-[#151515] border border-[#2A2A2A] rounded-lg px-3">
          <Filter className="w-4 h-4 text-[#666666]" />
          <select 
            className="bg-transparent text-sm text-[#A0A0A0] py-2.5 pr-2 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value={InvoiceStatus.PAID}>Paid</option>
            <option value={InvoiceStatus.ISSUED}>Issued</option>
            <option value={InvoiceStatus.DRAFT}>Draft</option>
            <option value={InvoiceStatus.OVERDUE}>Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1E1E1E] text-[#A0A0A0] uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {filteredInvoices.map(invoice => {
                  const customer = customers.find(c => c.id === invoice.customerId);
                  return (
                    <tr key={invoice.id} className="hover:bg-[#1E1E1E] transition-colors group">
                      <td className="px-6 py-4 text-white font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{customer?.firstName} {customer?.lastName}</span>
                          <span className="text-[#666666] text-xs">{customer?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-[#A0A0A0]">
                        {formatDate(invoice.dueAt)}
                      </td>
                      <td className="px-6 py-4 text-white font-bold">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.status !== InvoiceStatus.PAID && (
                            <button 
                              onClick={() => onUpdateStatus(invoice.id, InvoiceStatus.PAID)}
                              title="Mark as Paid"
                              className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-amber-400 hover:bg-amber-400/10 rounded-md">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-[#666666] hover:text-red-500 hover:bg-red-500/10 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#666666]" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold">No invoices found</h3>
              <p className="text-[#A0A0A0] text-sm mt-1">Try changing your filters or create a new invoice.</p>
            </div>
            <button 
              onClick={onAdd}
              className="px-6 py-2 bg-[#1E1E1E] border border-[#2A2A2A] text-white rounded-lg hover:bg-[#252525] transition-all"
            >
              Add Your First Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
