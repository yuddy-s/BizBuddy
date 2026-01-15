
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Plus,
  Bell,
  Search,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import CustomerList from './components/CustomerList';
import Transactions from './components/Transactions';
import SettingsPage from './components/SettingsPage';
import Communications from './components/Communications';
import { 
  Organization, 
  Customer, 
  Invoice, 
  Transaction, 
  InvoiceStatus,
  TransactionType,
  TransactionSource
} from './types';

// Initial Mock Data
const INITIAL_ORG: Organization = {
  id: 'org_1',
  name: 'Shift Performance Hub',
  taxRate: 8.25,
  stripeAccountId: 'acct_12345'
};

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    firstName: 'Alex',
    lastName: 'Russo',
    email: 'alex@trackday.com',
    phone: '555-0123',
    company: 'Track Enthusiasts LLC',
    address: '123 Raceway Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cust_2',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.c@driftking.io',
    phone: '555-9876',
    company: 'Apex Drifting',
    address: '456 Tire Smoke Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    organizationId: 'org_1',
    customerId: 'cust_1',
    invoiceNumber: 'INV-2024-1001',
    status: InvoiceStatus.PAID,
    issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 1200,
    taxAmount: 99,
    total: 1299,
    lineItems: [
      { id: 'li_1', description: 'ECU Remapping - Stage 2', quantity: 1, unitPrice: 800, category: 'Labor', total: 800 },
      { id: 'li_2', description: 'Performance Air Filter', quantity: 2, unitPrice: 200, category: 'Parts', total: 400 }
    ]
  },
  {
    id: 'inv_2',
    organizationId: 'org_1',
    customerId: 'cust_2',
    invoiceNumber: 'INV-2024-1002',
    status: InvoiceStatus.ISSUED,
    issuedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: null,
    subtotal: 3500,
    taxAmount: 288.75,
    total: 3788.75,
    lineItems: [
      { id: 'li_3', description: 'Coilovers Installation', quantity: 1, unitPrice: 1500, category: 'Labor', total: 1500 },
      { id: 'li_4', description: 'KW V3 Coilover Kit', quantity: 1, unitPrice: 2000, category: 'Parts', total: 2000 }
    ]
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    organizationId: 'org_1',
    invoiceId: 'inv_1',
    type: TransactionType.PAYMENT,
    amount: 1299,
    source: TransactionSource.STRIPE,
    description: 'Payment for INV-2024-1001',
    transactedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [organization, setOrganization] = useState<Organization>(INITIAL_ORG);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  const addInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    setActiveTab('invoices');
  };

  const addCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const addTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status, paidAt: status === InvoiceStatus.PAID ? new Date().toISOString() : inv.paidAt } : inv));
    if (status === InvoiceStatus.PAID && inv.status !== InvoiceStatus.PAID) {
      const newTx: Transaction = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        organizationId: organization.id,
        invoiceId: id,
        type: TransactionType.PAYMENT,
        amount: inv.total,
        source: TransactionSource.MANUAL,
        description: `Payment for ${inv.invoiceNumber}`,
        transactedAt: new Date().toISOString()
      };
      addTransaction(newTx);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard invoices={invoices} transactions={transactions} customers={customers} onNavigate={setActiveTab} organization={organization} />;
      case 'invoices':
        return <InvoiceList invoices={invoices} customers={customers} onAdd={() => setActiveTab('new-invoice')} onUpdateStatus={updateInvoiceStatus} />;
      case 'new-invoice':
        return <InvoiceForm customers={customers} organization={organization} onSubmit={addInvoice} onCancel={() => setActiveTab('invoices')} onAddCustomer={addCustomer} />;
      case 'customers':
        return <CustomerList customers={customers} invoices={invoices} onAdd={addCustomer} />;
      case 'transactions':
        return <Transactions transactions={transactions} invoices={invoices} onAdd={addTransaction} />;
      case 'communications':
        return <Communications customers={customers} organization={organization} invoices={invoices} />;
      case 'settings':
        return <SettingsPage organization={organization} onUpdate={setOrganization} />;
      default:
        return <Dashboard invoices={invoices} transactions={transactions} customers={customers} onNavigate={setActiveTab} organization={organization} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 p-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-md md:hidden">
        <Menu className="w-5 h-5 text-white" />
      </button>

      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-40 w-64 h-full bg-[#151515] border-r border-[#2A2A2A] transition-transform duration-300 md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl italic tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.5)]">BB</div>
            <div>
              <h1 className="text-white font-bold leading-none">BizBuddy</h1>
              <p className="text-[10px] text-[#A0A0A0] uppercase tracking-widest mt-1">Performance Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<FileText className="w-5 h-5" />} label="Invoices" active={activeTab === 'invoices' || activeTab === 'new-invoice'} onClick={() => setActiveTab('invoices')} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Customers" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Communications" active={activeTab === 'communications'} onClick={() => setActiveTab('communications')} />
          <NavItem icon={<CreditCard className="w-5 h-5" />} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">Mario Andretti</p>
              <p className="text-[10px] text-[#A0A0A0] truncate">mario@shift.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-[#151515] border-b border-[#2A2A2A] flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#A0A0A0] hidden sm:inline">Organization</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-md text-white font-medium">{organization.name}</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-[#1E1E1E] border border-[#2A2A2A] rounded-md px-3 py-1.5 w-64">
              <Search className="w-4 h-4 text-[#666666]" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder-[#666666]" />
            </div>
            <Bell className="w-5 h-5 text-[#A0A0A0]" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E]'}`}>
    <span className={`${active ? 'text-white' : 'text-[#666666] group-hover:text-blue-400'}`}>{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default App;
