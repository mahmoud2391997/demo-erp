import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, Supplier } from '../types';
import { Plus, Search, Package, AlertTriangle, Truck, DollarSign, BarChart3, X as XIcon } from 'lucide-react';

export default function InventoryModule() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    sku: '',
    stockQuantity: 0,
    unitPrice: 0,
    lowStockThreshold: 10
  });

  useEffect(() => {
    const qItems = query(collection(db, 'inventory'), orderBy('name'));
    const unsubscribeItems = onSnapshot(qItems, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(docs);
      setLoading(false);
    });

    const qSuppliers = query(collection(db, 'suppliers'), orderBy('name'));
    const unsubscribeSuppliers = onSnapshot(qSuppliers, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
      setSuppliers(docs);
    });

    return () => {
      unsubscribeItems();
      unsubscribeSuppliers();
    };
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'inventory'), newItem);
      setShowAddModal(false);
      setNewItem({
        name: '',
        sku: '',
        stockQuantity: 0,
        unitPrice: 0,
        lowStockThreshold: 10
      });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.stockQuantity <= (item.lowStockThreshold || 0));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">Track stock levels, suppliers, and orders.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total SKU Count</div>
          <div className="text-3xl font-bold text-slate-900">{items.length}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Inventory Value</div>
          <div className="text-3xl font-bold text-slate-900">
            ${items.reduce((acc, item) => acc + (item.stockQuantity * item.unitPrice), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Low Stock Alerts</div>
            <div className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {lowStockItems.length}
            </div>
          </div>
          {lowStockItems.length > 0 && (
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-600 animate-pulse">
              <AlertTriangle size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search inventory by name or SKU..."
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
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Loading inventory...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No items found.</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Package size={20} />
                        </div>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-500">{item.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${item.stockQuantity <= (item.lowStockThreshold || 0) ? 'text-red-600' : 'text-slate-900'}`}>
                          {item.stockQuantity}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Min: {item.lowStockThreshold}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">${item.unitPrice.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600">${(item.stockQuantity * item.unitPrice).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.stockQuantity <= (item.lowStockThreshold || 0) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add New Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Waterproofing Membrane"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">SKU</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="WPM-001"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit Price ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="45.00"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Stock</label>
                  <input 
                    required
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="100"
                    value={newItem.stockQuantity}
                    onChange={(e) => setNewItem({...newItem, stockQuantity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Low Stock Alert</label>
                  <input 
                    required
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="10"
                    value={newItem.lowStockThreshold}
                    onChange={(e) => setNewItem({...newItem, lowStockThreshold: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Register Inventory Item
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
