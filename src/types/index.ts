export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'billed';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starter' | 'Main Course' | 'Dessert' | 'Beverage' | 'Bread' | 'Rice';
  image?: string;
  available: boolean;
  deleted?: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  name: string;
  status: 'free' | 'occupied' | 'dirty' | 'reserved';
  capacity: number;
  currentOrderId?: string;
  deleted?: boolean;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  category: 'Vegetables' | 'Dairy' | 'Grain' | 'Spices' | 'Meat' | 'Supplies' | 'Beverage' | 'Other';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'Grocery' | 'Utility' | 'Salary' | 'Maintenance' | 'Other';
}

export interface Transaction {
  id: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  timestamp: string;
}

export type UserRole = 'admin' | 'chef' | 'waiter';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  status?: 'active' | 'inactive';
}

export interface GlobalSettings {
  waiterStationEnabled: boolean;
}
