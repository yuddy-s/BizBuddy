
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Plus, 
  MoreHorizontal,
  ChevronRight,
  X,
  Building
} from 'lucide-react';
import { Customer, Invoice, InvoiceStatus } from '../types';
import { formatCurrency } from '../lib/utils';

interface CustomerListProps {
  customers: Customer[];
  invoices: Invoice[];
  onAdd: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, invoices, onAdd }) => {
  const [search, setSearch] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const customerStats = useMemo(() => {
    return customers.map(customer => {
      const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
      const totalSpent = customerInvoices
        .filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + Number(inv.total), 0);
      return {
        ...customer,
        invoiceCount: customerInvoices.length,
        totalSpent
      };
    });
  }, [customers, invoices]);

  const filteredCustomers = customerStats.filter(c => 
    c.firstName.toLowerCase().includes(search.toLowerCase()) || 
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers</h2>
          <p className="text-[#A0A0A0]">Manage your client relationships and purchase history.</p>
        </div>
        <button 
          onClick={() => setIsAddingCustomer(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
        <input 
          type="text" 
          placeholder="Search customers by name, email, or company..." 
          className="w-full bg-[#151515] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 group hover:border-[#3A3A3A] transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-500 font-bold text-lg border border-blue-500/20">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <h3 className="text-white font-bold">{customer.firstName} {customer.lastName}</h3>
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <Building className="w-3 h-3" /> {customer.company || 'Private Owner'}
                  </p>
                </div>
              </div>
              <button className="text-[#666666] hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                <Phone className="w-3.5 h-3.5" />
                <span>{customer.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-[#2A2A2A]">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#666666] tracking-widest">Invoices</p>
                <p className="text-sm font-bold text-white mt-0.5">{customer.invoiceCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#666666] tracking-widest">Total Spent</p>
                <p className="text-sm font-bold text-emerald-500 mt-0.5">{formatCurrency(customer.totalSpent)}</p>
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-between text-xs font-semibold text-blue-500 py-2 border border-blue-500/10 rounded-lg hover:bg-blue-500/5 transition-all px-4">
              View Full Profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
            <Users className="w-12 h-12 text-[#2A2A2A]" />
            <p className="text-[#666666]">No customers match your search.</p>
          </div>
        )}
      </div>

      {isAddingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add New Customer</h3>
              <button onClick={() => setIsAddingCustomer(false)}><X className="w-5 h-5 text-[#666666]" /></button>
            </div>
            <CustomerFullForm 
              onSave={(c) => { onAdd(c); setIsAddingCustomer(false); }} 
              onCancel={() => setIsAddingCustomer(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerFullForm: React.FC<{ onSave: (c: Customer) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleSave = () => {
    if (!formData.firstName || !formData.email) return;
    onSave({
      id: `cust_${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#666666] mb-1">First Name*</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-[#666666] mb-1">Last Name</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Email*</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Phone</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Company</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Address</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label className="block text-xs text-[#666666] mb-1">City</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
        </div>
        <div className="col-span-1">
          <label className="block text-xs text-[#666666] mb-1">State</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
        </div>
        <div className="col-span-1">
          <label className="block text-xs text-[#666666] mb-1">Zip</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-[#151515]">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-[#A0A0A0] hover:text-white">Cancel</button>
        <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Save Customer</button>
      </div>
    </div>
  )
}

export default CustomerList;
