import { MenuItem, Table, StockItem, Order } from '../types';

export const mockMenuItems: MenuItem[] = [
  {
    id: 'm1',
    name: 'Butter Chicken',
    description: 'Rich and creamy tomato-based chicken curry',
    price: 350,
    category: 'Main Course',
    available: true
  },
  {
    id: 'm2',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese with spices',
    price: 280,
    category: 'Starter',
    available: true
  },
  {
    id: 'm3',
    name: 'Garlic Naan',
    description: 'Freshly baked leavened bread with garlic',
    price: 60,
    category: 'Bread',
    available: true
  },
  {
    id: 'm4',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils with cream',
    price: 240,
    category: 'Main Course',
    available: true
  },
  {
    id: 'm5',
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink with mango pulp',
    price: 120,
    category: 'Beverage',
    available: true
  },
  {
    id: 'm6',
    name: 'Gulab Jamun',
    description: 'Deep-fried milk dumplings in sugar syrup',
    price: 80,
    category: 'Dessert',
    available: true
  }
];

export const mockTables: Table[] = [
  { id: 't1', name: 'Table 1', status: 'free', capacity: 4 },
  { id: 't2', name: 'Table 2', status: 'free', capacity: 2 },
  { id: 't3', name: 'Table 3', status: 'free', capacity: 6 },
  { id: 't4', name: 'Table 4', status: 'free', capacity: 4 },
  { id: 't5', name: 'Table 5', status: 'free', capacity: 8 },
  { id: 't6', name: 'Table 6', status: 'free', capacity: 2 },
];

export const mockStock: StockItem[] = [
  { id: 's1', name: 'Chicken', quantity: 15, unit: 'kg', minThreshold: 5, category: 'Meat' },
  { id: 's2', name: 'Paneer', quantity: 8, unit: 'kg', minThreshold: 3, category: 'Dairy' },
  { id: 's3', name: 'Onions', quantity: 50, unit: 'kg', minThreshold: 20, category: 'Vegetables' },
  { id: 's4', name: 'Butter', quantity: 10, unit: 'kg', minThreshold: 2, category: 'Dairy' },
];

export const mockOrders: Order[] = [];
