import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Lead } from '../types';
import { Plus, Search, UserPlus, Mail, Building2, TrendingUp, Filter, BarChart3, X as XIcon } from 'lucide-react';

export default function SalesModule() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    company: '',
    email: '',
    status: 'New',
    value: 0,
    source: 'Website'
  });

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('status'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leads'), newLead);
      setShowAddModal(false);
      setNewLead({
        name: '',
        company: '',
        email: '',
        status: 'New',
        value: 0,
        source: 'Website'
      });
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalValue: leads.reduce((acc, lead) => acc + (lead.value || 0), 0),
    wonValue: leads.filter(l => l.status === 'Won').reduce((acc, lead) => acc + (lead.value || 0), 0),
    conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'Won').length / leads.length * 100).toFixed(1) : 0
  };

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Contacted': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Quotation Sent': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Negotiation': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Won': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Lost': 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sales & Marketing</h2>
          <p className="text-slate-500">Manage leads, campaigns, and sales funnel.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <UserPlus size={20} />
          Add New Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Pipeline Value</div>
          <div className="text-3xl font-bold text-slate-900">${stats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Closed Won</div>
          <div className="text-3xl font-bold text-green-600">${stats.wonValue.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Conversion Rate</div>
          <div className="text-3xl font-bold text-slate-900">{stats.conversionRate}%</div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search leads by name or company..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <th className="px-6 py-4">Lead / Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Building2 size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{lead.name}</span>
                          <span className="text-xs text-slate-500">{lead.company}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600">${(lead.value || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{lead.source}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Edit Lead</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add New Sales Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Jane Smith"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Acme Corp"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Value ($)</label>
                  <input 
                    required
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="15000"
                    value={newLead.value}
                    onChange={(e) => setNewLead({...newLead, value: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newLead.status}
                    onChange={(e) => setNewLead({...newLead, status: e.target.value as any})}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Source</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., Website, LinkedIn, Referral"
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Register Sales Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const X = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
