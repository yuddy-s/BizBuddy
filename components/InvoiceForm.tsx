
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { Customer, Organization, Invoice, InvoiceStatus, LineItem } from '../types';
import { formatCurrency } from '../lib/utils';

interface InvoiceFormProps {
  customers: Customer[];
  organization: Organization;
  onSubmit: (invoice: Invoice) => void;
  onCancel: () => void;
  onAddCustomer: (customer: Customer) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ customers, organization, onSubmit, onCancel, onAddCustomer }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Omit<LineItem, 'id' | 'total'>[]>([
    { description: '', quantity: 1, unitPrice: 0, category: 'Labor' }
  ]);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Totals calculation
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const taxAmount = useMemo(() => {
    return subtotal * (organization.taxRate / 100);
  }, [subtotal, organization.taxRate]);

  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, category: 'Service' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof Omit<LineItem, 'id' | 'total'>, value: string | number) => {
    const newItems = [...lineItems];
    (newItems[index] as any)[field] = value;
    setLineItems(newItems);
  };

  const handleSubmit = (status: InvoiceStatus) => {
    if (!selectedCustomerId) {
      alert("Please select a customer.");
      return;
    }

    const newInvoice: Invoice = {
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      organizationId: organization.id,
      customerId: selectedCustomerId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      issuedAt: status === InvoiceStatus.ISSUED ? new Date().toISOString() : null,
      dueAt: new Date(dueDate).toISOString(),
      paidAt: null,
      subtotal,
      taxAmount,
      total,
      notes,
      lineItems: lineItems.map((item, i) => ({
        ...item,
        id: `li_${i}`,
        total: item.quantity * item.unitPrice
      }))
    };

    onSubmit(newInvoice);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Invoice</h2>
          <p className="text-[#A0A0A0]">Drafting a new service record or performance upgrade bill.</p>
        </div>
        <button onClick={onCancel} className="text-[#666666] hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Section */}
        <section className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">Customer Details</h3>
            <button 
              onClick={() => setIsAddingCustomer(true)}
              className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> New Customer
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Select Customer</label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
              >
                <option value="">Choose a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            
            {selectedCustomerId && (
              <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                <p className="text-sm font-semibold text-white">
                  {customers.find(c => c.id === selectedCustomerId)?.firstName} {customers.find(c => c.id === selectedCustomerId)?.lastName}
                </p>
                <p className="text-xs text-[#A0A0A0] mt-1">{customers.find(c => c.id === selectedCustomerId)?.email}</p>
                <p className="text-xs text-[#A0A0A0]">{customers.find(c => c.id === selectedCustomerId)?.address}</p>
              </div>
            )}
          </div>
        </section>

        {/* Invoice Config */}
        <section className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Issue Date</label>
              <input 
                type="date" 
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Due Date</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
              />
            </div>
          </div>
        </section>
      </div>

      {/* Line Items */}
      <section className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider mb-6">Service & Parts Items</h3>
        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-[#666666] uppercase tracking-widest">
            <div className="col-span-6">Description</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#1E1E1E] border border-[#2A2A2A] p-4 rounded-lg group">
                <div className="col-span-1 sm:col-span-6">
                  <input 
                    placeholder="e.g., Turbocharger Installation"
                    value={item.description}
                    onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-[#666666]"
                  />
                </div>
                <div className="col-span-1 sm:col-span-1">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value))}
                    className="w-full bg-transparent border-none outline-none text-sm text-white"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <input 
                    type="number" 
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value))}
                    className="w-full bg-transparent border-none outline-none text-sm text-white"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 flex items-center text-sm font-bold text-white">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </div>
                <div className="col-span-1 sm:col-span-1 flex justify-end">
                  <button onClick={() => removeLineItem(idx)} className="text-[#666666] hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={addLineItem}
            className="flex items-center gap-2 text-xs font-semibold text-blue-500 hover:text-blue-400 mt-4 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>
      </section>

      {/* Summary and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-widest">Notes & Instructions</label>
          <textarea 
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional details or warranty info..."
            className="w-full bg-[#151515] border border-[#2A2A2A] rounded-xl p-4 text-sm text-white outline-none focus:border-blue-500 placeholder-[#666666] resize-none"
          />
        </div>
        
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">Subtotal</span>
            <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0A0A0]">Tax ({organization.taxRate}%)</span>
            <span className="text-white font-medium">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="pt-4 border-t border-[#2A2A2A] flex justify-between items-end">
            <span className="text-xs font-bold text-[#A0A0A0] uppercase">Total</span>
            <span className="text-2xl font-black text-blue-500">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12">
        <button 
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-[#2A2A2A] text-[#A0A0A0] font-medium hover:bg-[#151515] transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={() => handleSubmit(InvoiceStatus.DRAFT)}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1E1E1E] text-white font-medium hover:bg-[#252525] border border-[#2A2A2A] transition-all"
        >
          Save as Draft
        </button>
        <button 
          onClick={() => handleSubmit(InvoiceStatus.ISSUED)}
          className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Save & Issue
        </button>
      </div>

      {/* Inline Customer Modal Simulation */}
      {isAddingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add New Customer</h3>
              <button onClick={() => setIsAddingCustomer(false)}><X className="w-5 h-5 text-[#666666]" /></button>
            </div>
            <CustomerMinimalForm 
              onSave={(c) => { onAddCustomer(c); setIsAddingCustomer(false); setSelectedCustomerId(c.id); }} 
              onCancel={() => setIsAddingCustomer(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerMinimalForm: React.FC<{ onSave: (c: Customer) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const handleSave = () => {
    if (!formData.firstName || !formData.email) return;
    onSave({
      id: `cust_${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      address: '',
      city: '',
      state: '',
      zip: '',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#666666] mb-1">First Name</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-[#666666] mb-1">Last Name</label>
          <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Email</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs text-[#666666] mb-1">Phone</label>
        <input className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-[#A0A0A0] hover:text-white">Cancel</button>
        <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">Save Customer</button>
      </div>
    </div>
  )
}

export default InvoiceForm;
