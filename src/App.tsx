/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import Login from './components/Login';
import HRModule from './components/HRModule';
import InventoryModule from './components/InventoryModule';
import SalesModule from './components/SalesModule';

// Dashboard component with real-time stats (simplified for now)
const Dashboard = () => (
  <div className="space-y-8">
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      <p className="text-slate-500">Overview of your enterprise operations.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Revenue</span>
          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
            <span className="text-xs font-bold">$</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">$1,245,600</div>
        <div className="text-xs text-green-600 font-medium">+12.5% from last month</div>
      </div>
      
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Active Projects</span>
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600">
            <span className="text-xs font-bold">P</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">24</div>
        <div className="text-xs text-blue-600 font-medium">4 projects near completion</div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Low Stock Items</span>
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-600">
            <span className="text-xs font-bold">!</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">8</div>
        <div className="text-xs text-red-600 font-medium">Requires immediate attention</div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Employees</span>
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600">
            <span className="text-xs font-bold">E</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">156</div>
        <div className="text-xs text-purple-600 font-medium">3 new hires this week</div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">New Lead Registered</div>
                <div className="text-xs text-slate-500">Acme Corp - $15,000 potential</div>
              </div>
              <div className="text-xs text-slate-400">2h ago</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">System Health</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Database Sync</span>
              <span className="text-green-600">Optimal</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[98%]"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Server Response</span>
              <span className="text-blue-600">42ms</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%]"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Storage Capacity</span>
              <span className="text-purple-600">12% Used</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[12%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

import { TrendingUp } from 'lucide-react';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  useEffect(() => {
    const initDummyData = async () => {
      // Check if employees collection is empty
      const empSnap = await getDocs(query(collection(db, 'employees'), limit(1)));
      if (empSnap.empty) {
        const dummyEmployees = [
          { name: 'Ahmed Hassan', email: 'ahmed@constructpro.com', role: 'Project Manager', salary: 12000, joiningDate: '2024-01-15' },
          { name: 'Sarah Jones', email: 'sarah@constructpro.com', role: 'Site Engineer', salary: 8500, joiningDate: '2024-02-20' },
          { name: 'Michael Chen', email: 'michael@constructpro.com', role: 'Safety Officer', salary: 7000, joiningDate: '2024-03-05' },
          { name: 'Fatima Al-Sayed', email: 'fatima@constructpro.com', role: 'HR Manager', salary: 9500, joiningDate: '2023-11-12' },
        ];
        for (const emp of dummyEmployees) {
          await addDoc(collection(db, 'employees'), emp);
        }
      }

      // Check if inventory collection is empty
      const invSnap = await getDocs(query(collection(db, 'inventory'), limit(1)));
      if (invSnap.empty) {
        const dummyInventory = [
          { name: 'Portland Cement (50kg)', sku: 'CEM-POR-001', stockQuantity: 500, unitPrice: 12.5, lowStockThreshold: 100 },
          { name: 'Steel Rebar 12mm', sku: 'STL-REB-012', stockQuantity: 1200, unitPrice: 4.2, lowStockThreshold: 200 },
          { name: 'Safety Helmets (Yellow)', sku: 'PPE-HEL-YEL', stockQuantity: 45, unitPrice: 15.0, lowStockThreshold: 50 },
          { name: 'Waterproofing Membrane', sku: 'WPM-001', stockQuantity: 85, unitPrice: 45.0, lowStockThreshold: 20 },
        ];
        for (const item of dummyInventory) {
          await addDoc(collection(db, 'inventory'), item);
        }
      }

      // Check if leads collection is empty
      const leadsSnap = await getDocs(query(collection(db, 'leads'), limit(1)));
      if (leadsSnap.empty) {
        const dummyLeads = [
          { name: 'Robert Miller', company: 'Skyline Developers', status: 'Quotation Sent', value: 250000, source: 'LinkedIn', email: 'robert@skyline.com' },
          { name: 'Elena Rodriguez', company: 'Urban Living Co', status: 'Negotiation', value: 120000, source: 'Referral', email: 'elena@urbanliving.com' },
          { name: 'John Smith', company: 'Acme Corp', status: 'New', value: 15000, source: 'Website', email: 'john@acme.com' },
          { name: 'David Wilson', company: 'Global Build', status: 'Won', value: 500000, source: 'Direct', email: 'david@globalbuild.com' },
        ];
        for (const lead of dummyLeads) {
          await addDoc(collection(db, 'leads'), lead);
        }
      }
    };

    initDummyData();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hr" element={<HRModule />} />
          <Route path="/inventory" element={<InventoryModule />} />
          <Route path="/sales" element={<SalesModule />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
