
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertCircle,
  ChevronRight,
  Zap,
  Plus
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
// Added TransactionSource to types import
import { Invoice, Transaction, Customer, InvoiceStatus, Organization, TransactionType, TransactionSource } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { getBusinessInsights, BusinessInsight } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  transactions: Transaction[];
  customers: Customer[];
  organization: Organization;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, transactions, customers, organization, onNavigate }) => {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = transactions
      .filter(t => t.type === TransactionType.PAYMENT)
      .reduce((acc, t) => acc + Number(t.amount), 0);
    const totalInvoices = invoices.length;
    const paidInvoicesCount = invoices.filter(i => i.status === InvoiceStatus.PAID).length;
    const pendingInvoicesCount = invoices.filter(i => i.status === InvoiceStatus.ISSUED || i.status === InvoiceStatus.DRAFT).length;
    const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;
    
    const thisMonthRevenue = transactions
      .filter(t => t.type === TransactionType.PAYMENT && new Date(t.transactedAt).getMonth() === new Date().getMonth())
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    return {
      totalRevenue,
      totalInvoices,
      paidInvoicesCount,
      pendingInvoicesCount,
      overdueInvoices,
      thisMonthRevenue
    };
  }, [invoices, transactions]);

  // Chart Data
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      // Sum transactions for this month
      const monthRevenue = transactions
        .filter(t => t.type === TransactionType.PAYMENT && new Date(t.transactedAt).getMonth() === monthIndex)
        .reduce((acc, t) => acc + Number(t.amount), 0);
      
      data.push({
        name: monthName,
        revenue: monthRevenue || (stats.totalRevenue > 0 ? (stats.totalRevenue / 12) * (0.8 + Math.random() * 0.4) : 0)
      });
    }
    return data;
  }, [transactions, stats.totalRevenue]);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    const data = await getBusinessInsights(invoices, transactions, organization.name);
    setInsights(data);
    setLoadingInsights(false);
  }, [invoices, transactions, organization.name]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-[#A0A0A0] mt-1">Welcome back. Here's what's happening at {organization.name}.</p>
        </div>
        <button 
          onClick={() => onNavigate('new-invoice')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          change="+12.5%" 
          icon={<DollarSign className="w-5 h-5" />} 
          color="text-blue-500"
        />
        <StatCard 
          title="This Month" 
          value={formatCurrency(stats.thisMonthRevenue)} 
          change="+8.2%" 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="text-emerald-500"
        />
        <StatCard 
          title="Active Invoices" 
          value={stats.totalInvoices.toString()} 
          change={`${stats.paidInvoicesCount} paid`} 
          icon={<FileText className="w-5 h-5" />} 
          color="text-purple-500"
        />
        <StatCard 
          title="Overdue" 
          value={stats.overdueInvoices.toString()} 
          change="Urgent Action" 
          icon={<AlertCircle className="w-5 h-5" />} 
          color={stats.overdueInvoices > 0 ? "text-red-500" : "text-gray-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Performance</h3>
            <select className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-md text-xs text-[#A0A0A0] px-2 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666666" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#666666" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Business Insights */}
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-500/10 rounded-md">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Shop Insights</h3>
          </div>
          <p className="text-xs text-[#A0A0A0] mb-6">AI-generated recommendations based on your performance data.</p>
          
          <div className="flex-1 space-y-4">
            {loadingInsights ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-[#1E1E1E] h-20 rounded-lg" />
                ))}
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg group hover:border-blue-500/50 transition-all">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                      insight.priority === 'High' ? 'bg-red-500/10 text-red-500' : 
                      insight.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A0A0] line-clamp-2">{insight.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-[#666666]">No insights available yet.</p>
              </div>
            )}
          </div>

          <button 
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="mt-6 w-full py-2 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg hover:bg-blue-500/5 transition-all disabled:opacity-50"
          >
            {loadingInsights ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
            <button 
              onClick={() => onNavigate('invoices')}
              className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1E1E1E] text-[#A0A0A0]">
                <tr>
                  <th className="px-6 py-3 font-medium">Invoice #</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {invoices.length > 0 ? invoices.slice(0, 5).map(invoice => (
                  <tr key={invoice.id} className="hover:bg-[#1E1E1E] transition-colors cursor-pointer" onClick={() => onNavigate('invoices')}>
                    <td className="px-6 py-4 text-white font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">
                      {customers.find(c => c.id === invoice.customerId)?.firstName} {customers.find(c => c.id === invoice.customerId)?.lastName}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">{formatCurrency(invoice.total)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#666666]">No recent invoices</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <button 
              onClick={() => onNavigate('transactions')}
              className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1E1E1E] text-[#A0A0A0]">
                <tr>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {transactions.length > 0 ? transactions.slice(0, 5).map(tx => (
                  <tr key={tx.id} className="hover:bg-[#1E1E1E] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{tx.description}</td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === TransactionType.PAYMENT ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === TransactionType.PAYMENT ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                        tx.source === TransactionSource.STRIPE ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {tx.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#666666]">{formatDate(tx.transactedAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#666666]">No transactions yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string, 
  value: string, 
  change: string, 
  icon: React.ReactNode, 
  color: string 
}> = ({ title, value, change, icon, color }) => (
  <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 transition-all hover:border-[#3A3A3A] group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 bg-[#1E1E1E] rounded-lg ${color} transition-colors group-hover:bg-[#252525]`}>
        {icon}
      </div>
      <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-emerald-500' : 'text-gray-400'}`}>
        {change}
      </span>
    </div>
    <p className="text-sm font-medium text-[#A0A0A0] uppercase tracking-wider">{title}</p>
    <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
  </div>
);

export const StatusBadge: React.FC<{ status: InvoiceStatus | string }> = ({ status }) => {
  const styles = {
    [InvoiceStatus.PAID]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [InvoiceStatus.ISSUED]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [InvoiceStatus.DRAFT]: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    [InvoiceStatus.OVERDUE]: 'bg-red-500/10 text-red-500 border-red-500/20',
    [InvoiceStatus.CANCELLED]: 'bg-gray-800/50 text-gray-600 border-gray-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status as InvoiceStatus] || styles[InvoiceStatus.DRAFT]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
