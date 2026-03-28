export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'billed';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starter' | 'Main Course' | 'Dessert' | 'Beverage' | 'Bread' | 'Rice';
  image?: string;
  available: boolean;
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
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  category: 'Vegetables' | 'Dairy' | 'Grain' | 'Spices' | 'Meat' | 'Other';
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
