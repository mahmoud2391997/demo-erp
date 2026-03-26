export interface Employee {
  id?: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  joiningDate: string;
  passport?: string;
  visa?: string;
  emiratesId?: string;
}

export interface Payroll {
  id?: string;
  employeeId: string;
  amount: number;
  payCycle: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  date: string;
  overtime?: number;
  allowances?: number;
  deductions?: number;
}

export interface Performance {
  id?: string;
  employeeId: string;
  feedback: string;
  kpiScore: number;
  date: string;
  managerId: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  sku: string;
  stockQuantity: number;
  unitPrice: number;
  supplierId?: string;
  lowStockThreshold?: number;
}

export interface Supplier {
  id?: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  materialList?: string[];
}

export interface InventoryOrder {
  id?: string;
  type: 'Stock In' | 'Stock Out';
  itemId: string;
  quantity: number;
  date: string;
  supplierId?: string;
  notes?: string;
}

export interface Lead {
  id?: string;
  name: string;
  company?: string;
  status: 'New' | 'Contacted' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
  value?: number;
  source?: string;
  email?: string;
}

export interface Campaign {
  id?: string;
  name: string;
  budget: number;
  leadsGenerated?: number;
  revenueGenerated?: number;
  startDate: string;
  endDate?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager' | 'storekeeper' | 'sales';
  photoUrl?: string;
}
