
import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Calendar, 
  Plus, 
  Zap, 
  FileText, 
  Target, 
  Settings,
  ChevronRight,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  Customer, 
  Organization, 
  Invoice, 
  CommType, 
  CommCategory, 
  CampaignStatus,
  Campaign,
  ServiceReminder,
  CommunicationTemplate
} from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { generateMarketingCopy, getMarketingAdvice } from '../services/geminiService';

interface CommunicationsProps {
  customers: Customer[];
  organization: Organization;
  invoices: Invoice[];
}

const Communications: React.FC<CommunicationsProps> = ({ customers, organization, invoices }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab customers={customers} invoices={invoices} />;
      case 'campaigns': return <CampaignsTab customers={customers} />;
      case 'reminders': return <RemindersTab customers={customers} />;
      case 'templates': return <TemplatesTab />;
      case 'ai': return <AIAssistantTab customers={customers} invoices={invoices} />;
      default: return <OverviewTab customers={customers} invoices={invoices} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Communications & Marketing</h2>
          <p className="text-[#A0A0A0]">Automate reminders and engage your high-performance community.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-[#151515] border border-[#2A2A2A] rounded-xl w-fit">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={<BarChart3 className="w-4 h-4" />} />
        <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} label="Campaigns" icon={<Target className="w-4 h-4" />} />
        <TabButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} label="Service Reminders" icon={<Clock className="w-4 h-4" />} />
        <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} label="Templates" icon={<FileText className="w-4 h-4" />} />
        <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Assistant" icon={<Sparkles className="w-4 h-4" />} />
      </div>

      <div className="mt-8">
        {renderTab()}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-[#A0A0A0] hover:text-white hover:bg-[#1E1E1E]'}`}>
    {icon} {label}
  </button>
);

// --- Sub-Tabs ---

const OverviewTab: React.FC<{ customers: Customer[], invoices: Invoice[] }> = ({ customers, invoices }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Campaigns" value="12" change="+2 this month" icon={<Send className="text-blue-500" />} />
      <StatCard title="Avg. Open Rate" value="48.2%" change="+5% vs industry" icon={<Mail className="text-emerald-500" />} />
      <StatCard title="Active Reminders" value="156" change="12 due this week" icon={<Clock className="text-purple-500" />} />
      <StatCard title="Communications" value="2,401" change="Total all-time" icon={<MessageSquare className="text-amber-500" />} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { label: 'Campaign Sent', desc: 'Summer Tuning Special sent to 45 customers', time: '2h ago', icon: <Send className="w-4 h-4 text-blue-500" /> },
            { label: 'Reminder Delivered', desc: 'Oil change reminder for Alex Russo', time: '5h ago', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
            { label: 'New Template', desc: 'Stage 3 Completion template created', time: 'Yesterday', icon: <FileText className="w-4 h-4 text-purple-500" /> },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
              <div className="mt-1 p-2 bg-[#151515] rounded-md">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{item.label}</span>
                  <span className="text-[10px] text-[#666666]">{item.time}</span>
                </div>
                <p className="text-xs text-[#A0A0A0] mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Quick Marketing Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickActionBtn icon={<Send className="w-5 h-5" />} label="Quick Message" desc="Send manual SMS/Email" />
          <QuickActionBtn icon={<Target className="w-5 h-5" />} label="New Campaign" desc="Blast a segment" />
          <QuickActionBtn icon={<Clock className="w-5 h-5" />} label="Setup Reminder" desc="Automate service cycles" />
          <QuickActionBtn icon={<Sparkles className="w-5 h-5" />} label="AI Copywriter" desc="Generate emails instantly" />
        </div>
      </div>
    </div>
  </div>
);

const CampaignsTab: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const campaigns: Campaign[] = [
    { id: '1', organizationId: '1', name: 'Summer Performance Tune', type: CommType.EMAIL, status: CampaignStatus.SENT, body: '...', recipientCount: 145, sentAt: '2024-06-01', stats: { delivered: 144, opened: 82, clicked: 12 } },
    { id: '2', organizationId: '1', name: 'Turbo Kit Pre-Order', type: CommType.SMS, status: CampaignStatus.SCHEDULED, body: '...', recipientCount: 52, scheduledAt: '2024-07-15' },
    { id: '3', organizationId: '1', name: 'Track Day Safety Check', type: CommType.EMAIL, status: CampaignStatus.DRAFT, body: '...', recipientCount: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Marketing Campaigns</h3>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#3A3A3A] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                campaign.status === CampaignStatus.SENT ? 'bg-emerald-500/10 text-emerald-500' : 
                campaign.status === CampaignStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {campaign.status}
              </span>
              {campaign.type === CommType.EMAIL ? <Mail className="w-4 h-4 text-[#666666]" /> : <MessageSquare className="w-4 h-4 text-[#666666]" />}
            </div>
            <h4 className="text-white font-bold mb-1">{campaign.name}</h4>
            <p className="text-xs text-[#A0A0A0] mb-4">
              {campaign.status === CampaignStatus.SENT ? `Sent ${formatDate(campaign.sentAt!)}` : 
               campaign.status === CampaignStatus.SCHEDULED ? `Scheduled for ${formatDate(campaign.scheduledAt!)}` : 'Draft'}
            </p>

            {campaign.status === CampaignStatus.SENT && (
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-[#2A2A2A]">
                <div>
                  <p className="text-[10px] text-[#666666] font-bold uppercase">Sent</p>
                  <p className="text-sm font-bold text-white">{campaign.recipientCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#666666] font-bold uppercase">Open</p>
                  <p className="text-sm font-bold text-emerald-500">{campaign.stats?.opened}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#666666] font-bold uppercase">Clicks</p>
                  <p className="text-sm font-bold text-blue-500">{campaign.stats?.clicked}%</p>
                </div>
              </div>
            )}

            <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-[#A0A0A0] py-2 border border-[#2A2A2A] rounded-lg hover:bg-[#1E1E1E] transition-all">
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const RemindersTab: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const reminders: ServiceReminder[] = [
    { id: '1', organizationId: '1', customerId: null, serviceType: 'Synthetic Oil Change', intervalMonths: 6, reminderDays: 7, isActive: true },
    { id: '2', organizationId: '1', customerId: 'cust_1', serviceType: 'Turbo Inspection', intervalMonths: 12, reminderDays: 14, isActive: true, nextServiceDate: '2024-08-20' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Service Reminders</h3>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      <section>
        <h4 className="text-xs font-bold text-[#666666] uppercase tracking-widest mb-4">Shop Default Cycles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.filter(r => !r.customerId).map(r => (
            <div key={r.id} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-white font-bold">{r.serviceType}</p>
                  <p className="text-xs text-[#A0A0A0]">Every {r.intervalMonths} months • {r.reminderDays} days notice</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-blue-500 rounded-full relative p-1"><div className="w-4 h-4 bg-white rounded-full ml-auto" /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-xs font-bold text-[#666666] uppercase tracking-widest mb-4">Customer Specific Schedule</h4>
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1E1E1E] text-[#A0A0A0] uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Next Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {reminders.filter(r => r.customerId).map(r => {
                const customer = customers.find(c => c.id === r.customerId);
                return (
                  <tr key={r.id} className="hover:bg-[#1E1E1E] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{customer?.firstName} {customer?.lastName}</td>
                    <td className="px-6 py-4 text-[#A0A0A0]">{r.serviceType}</td>
                    <td className="px-6 py-4 text-white">{formatDate(r.nextServiceDate!)}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">UPCOMING</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-blue-500 hover:underline">Complete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const TemplatesTab: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white">Communication Templates</h3>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm">
        <Plus className="w-4 h-4" /> New Template
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { name: 'Oil Change Reminder', type: 'Email', cat: 'Reminder', body: 'Time for your high-performance synthetic oil change...' },
        { name: 'Track Season Special', type: 'Email', cat: 'Marketing', body: 'Get 20% off all safety inspections this week...' },
        { name: 'Appointment Confirmed', type: 'SMS', cat: 'Transactional', body: 'Confirmed: See you at the hub tomorrow at {time}!' },
        { name: 'Thank You', type: 'Email', cat: 'Transactional', body: 'Thanks for trusting us with your build. Keep pushing.' },
      ].map((t, i) => (
        <div key={i} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6 group hover:border-blue-500/50 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-4">
             <span className="px-2 py-0.5 rounded bg-[#1E1E1E] text-[#666666] text-[10px] font-bold border border-[#2A2A2A] uppercase">{t.cat}</span>
             {t.type === 'Email' ? <Mail className="w-3.5 h-3.5 text-blue-500" /> : <MessageSquare className="w-3.5 h-3.5 text-amber-500" />}
          </div>
          <h4 className="text-white font-bold text-sm mb-2">{t.name}</h4>
          <p className="text-xs text-[#666666] line-clamp-2">{t.body}</p>
        </div>
      ))}
    </div>
  </div>
);

const AIAssistantTab: React.FC<{ customers: Customer[], invoices: Invoice[] }> = ({ customers, invoices }) => {
  const [chat, setChat] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input) return;
    const userMsg = input;
    setInput('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    
    const stats = {
      customerCount: customers.length,
      avgInvoice: invoices.reduce((acc, i) => acc + i.total, 0) / (invoices.length || 1)
    };
    
    const response = await getMarketingAdvice(userMsg, stats);
    setChat(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl h-[500px] flex flex-col">
          <div className="p-4 border-b border-[#2A2A2A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h4 className="text-white font-bold">Marketing Assistant Chat</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {chat.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-50">
                 <Zap className="w-12 h-12 mb-4" />
                 <p className="text-sm">I'm your AI Marketing Strategist. Ask me for campaign ideas, email copy, or growth advice tailored to your shop.</p>
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-[#1E1E1E] text-[#A0A0A0] border border-[#2A2A2A]'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-blue-500 text-xs animate-pulse">Assistant is thinking...</div>}
          </div>
          <div className="p-4 border-t border-[#2A2A2A] flex gap-2">
            <input 
              className="flex-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500"
              placeholder="e.g., Suggest a campaign for customers who haven't visited in 6 months"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAsk()}
            />
            <button onClick={handleAsk} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
           <h4 className="text-white font-bold mb-4 flex items-center gap-2">
             <Target className="w-4 h-4 text-blue-500" /> AI Suggested Segments
           </h4>
           <div className="space-y-3">
             <SegmentCard name="High-Value Tuners" desc="Spent >$2,500 in 6mo" count={12} />
             <SegmentCard name="At-Risk Builds" desc="No service in 9mo" count={4} />
             <SegmentCard name="Recent Upgraders" desc="New turbo/ECU in 3mo" count={8} />
           </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
           <h4 className="font-bold mb-2">Power Insight</h4>
           <p className="text-xs opacity-90 leading-relaxed">Your repeat customer rate is 65%. Targeting "At-Risk Builds" with a dyno-tuning discount could boost revenue by 15% this quarter.</p>
           <button className="mt-4 w-full py-2 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all">Create "At-Risk" Campaign</button>
        </div>
      </div>
    </div>
  );
};

const SegmentCard: React.FC<{ name: string, desc: string, count: number }> = ({ name, desc, count }) => (
  <div className="p-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg group hover:border-blue-500/50 cursor-pointer transition-all">
    <div className="flex items-center justify-between">
      <h5 className="text-xs font-bold text-white">{name}</h5>
      <span className="text-[10px] text-blue-400 font-bold">{count} clients</span>
    </div>
    <p className="text-[10px] text-[#666666] mt-1">{desc}</p>
  </div>
);

const StatCard: React.FC<{ title: string, value: string, change: string, icon: React.ReactNode }> = ({ title, value, change, icon }) => (
  <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-[#1E1E1E] rounded-lg">{icon}</div>
      <span className="text-[10px] text-[#666666] font-bold uppercase">{change}</span>
    </div>
    <p className="text-sm font-medium text-[#A0A0A0]">{title}</p>
    <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
  </div>
);

const QuickActionBtn: React.FC<{ icon: React.ReactNode, label: string, desc: string }> = ({ icon, label, desc }) => (
  <button className="flex flex-col items-start p-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl hover:border-blue-500 group transition-all">
    <div className="p-2 bg-[#151515] rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all mb-3">{icon}</div>
    <span className="text-sm font-bold text-white mb-1">{label}</span>
    <span className="text-[10px] text-[#666666] text-left">{desc}</span>
  </button>
);

export default Communications;
