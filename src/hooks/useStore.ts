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
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Table, MenuItem, Order, OrderStatus, StockItem, Expense, UserProfile, UserRole, GlobalSettings } from '../types';
import { mockTables, mockMenuItems, mockStock } from '../utils/mockData';

export function useStore() {
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({ waiterStationEnabled: true });
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

  // Real-time sync for Users (Staff)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    });
    return unsubscribe;
  }, []);

  // Real-time sync for Settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as GlobalSettings);
      } else {
        // Initialize if not exists
        setDoc(doc(db, 'settings', 'global'), { waiterStationEnabled: true });
      }
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

  const addTable = useCallback(async (table: Omit<Table, 'id'>) => {
    try {
      await addDoc(collection(db, 'tables'), table);
    } catch (error) {
      console.error("Error adding table: ", error);
    }
  }, []);

  const updateTable = useCallback(async (tableId: string, data: Partial<Table>) => {
    try {
      const tableRef = doc(db, 'tables', tableId);
      await updateDoc(tableRef, data);
    } catch (error) {
      console.error("Error updating table: ", error);
    }
  }, []);

  const deleteTable = useCallback(async (tableId: string) => {
    try {
      const tableRef = doc(db, 'tables', tableId);
      await updateDoc(tableRef, { deleted: true }); // Soft delete
      // Or hard delete: await deleteDoc(tableRef);
    } catch (error) {
      console.error("Error deleting table: ", error);
    }
  }, []);

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'menuItems'), item);
    } catch (error) {
      console.error("Error adding menu item: ", error);
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId: string, data: Partial<MenuItem>) => {
    try {
      const itemRef = doc(db, 'menuItems', itemId);
      await updateDoc(itemRef, data);
    } catch (error) {
      console.error("Error updating menu item: ", error);
    }
  }, []);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    try {
      const itemRef = doc(db, 'menuItems', itemId);
      await updateDoc(itemRef, { deleted: true });
    } catch (error) {
      console.error("Error deleting menu item: ", error);
    }
  }, []);

  const updateUserRole = useCallback(async (uid: string, role: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
    } catch (error) {
      console.error("Error updating user role: ", error);
    }
  }, []);

  const deleteUser = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error("Error deleting user role: ", error);
    }
  }, []);

  const updateUserStatus = useCallback(async (uid: string, status: 'active' | 'inactive') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { status });
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  }, []);

  const updateGlobalSettings = useCallback(async (newSettings: Partial<GlobalSettings>) => {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      await updateDoc(settingsRef, newSettings);
    } catch (error) {
      console.error("Error updating global settings: ", error);
    }
  }, []);

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
    users,
    settings,
    loading,
    addOrder,
    updateOrderStatus,
    addTable,
    updateTable,
    deleteTable,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    updateGlobalSettings,
    seedData
  };
}
