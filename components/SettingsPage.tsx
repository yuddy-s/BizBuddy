
import React, { useState } from 'react';
import { 
  Building, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Organization } from '../types';

interface SettingsPageProps {
  organization: Organization;
  onUpdate: (org: Organization) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ organization, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('organization');
  const [formData, setFormData] = useState(organization);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-[#A0A0A0]">Configure your workspace and payment integrations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1">
          <SettingsTabItem 
            icon={<Building className="w-4 h-4" />} 
            label="Organization" 
            active={activeTab === 'organization'} 
            onClick={() => setActiveTab('organization')} 
          />
          <SettingsTabItem 
            icon={<CreditCard className="w-4 h-4" />} 
            label="Stripe Connect" 
            active={activeTab === 'stripe'} 
            onClick={() => setActiveTab('stripe')} 
          />
          <SettingsTabItem 
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications" 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
          <SettingsTabItem 
            icon={<ShieldCheck className="w-4 h-4" />} 
            label="Security" 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
          />
        </aside>

        <div className="flex-1 bg-[#151515] border border-[#2A2A2A] rounded-xl p-8">
          {activeTab === 'organization' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-xl font-bold text-white">Organization Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">Shop Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest mb-2">Sales Tax Rate (%)</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                  >
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaved ? 'Settings Saved' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Payments Integration</h3>
              <p className="text-sm text-[#A0A0A0] max-w-2xl">
                Connect your Stripe account to automatically generate payment links for your invoices. Payments are deposited directly to your bank account.
              </p>
              
              <div className="p-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Stripe Status</h4>
                    {organization.stripeAccountId ? (
                      <div className="flex items-center gap-2 text-emerald-500 text-xs mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected: {organization.stripeAccountId}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-500 text-xs mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Not Connected
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  className="bg-white text-black hover:bg-gray-100 px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  {organization.stripeAccountId ? 'Configure Stripe' : 'Connect Stripe Account'}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Automatic Webhooks</h4>
                <div className="p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                  <code className="text-xs text-blue-400">https://bizbuddy.app/api/webhooks/stripe</code>
                </div>
                <p className="text-xs text-[#666666]">Use this URL in your Stripe Dashboard to enable real-time payment syncing.</p>
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="flex flex-col items-center justify-center py-20">
              <ShieldCheck className="w-12 h-12 text-[#2A2A2A] mb-4" />
              <p className="text-[#A0A0A0]">These settings are managed by your System Administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsTabItem: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
      active 
        ? 'bg-[#1E1E1E] text-white border border-[#2A2A2A]' 
        : 'text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E]'
    }`}
  >
    <span className={active ? 'text-blue-500' : 'text-[#666666]'}>{icon}</span>
    {label}
  </button>
);

export default SettingsPage;
