import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Table, MenuItem, Order, OrderStatus, StockItem, Expense } from '../types';
import { mockTables, mockMenuItems, mockStock } from '../utils/mockData';

export function useStore() {
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time sync for Tables
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tables'), (snapshot) => {
      const tablesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Table));
      setTables(tablesData.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return unsubscribe;
  }, []);

  // Real-time sync for Menu
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setMenuItems(menuData);
    });
    return unsubscribe;
  }, []);

  // Real-time sync for Orders
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    try {
      // 1. Add the order to Firestore
      await addDoc(collection(db, 'orders'), order);
      
      // 2. Update the table status
      const tableRef = doc(db, 'tables', order.tableId);
      await updateDoc(tableRef, {
        status: 'occupied',
        currentOrderId: order.id
      });
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });

      // If billed, free the table
      if (status === 'billed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const tableRef = doc(db, 'tables', order.tableId);
          await updateDoc(tableRef, {
            status: 'dirty',
            currentOrderId: null
          });
        }
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  }, [orders]);

  const seedData = async () => {
    try {
      const batch = writeBatch(db);
      
      // Seed Tables
      mockTables.forEach(table => {
        const ref = doc(db, 'tables', table.id);
        batch.set(ref, table);
      });

      // Seed Menu
      mockMenuItems.forEach(item => {
        const ref = doc(db, 'menuItems', item.id);
        batch.set(ref, item);
      });

      // Seed Stock
      mockStock.forEach(item => {
        const ref = doc(db, 'stock', item.id);
        batch.set(ref, item);
      });

      await batch.commit();
      console.log("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding data: ", error);
    }
  };

  return {
    tables,
    menuItems,
    orders,
    loading,
    addOrder,
    updateOrderStatus,
    seedData
  };
}
