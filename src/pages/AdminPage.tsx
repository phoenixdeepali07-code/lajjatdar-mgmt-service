import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../components/AuthGuard';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Package, 
  Receipt, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3,
  Search,
  AlertTriangle,
  Grid3X3,
  UserPlus,
  ShieldCheck,
  Lock,
  Unlock,
  Power,
  Users,
  LogOut,
  ChefHat,
  ShoppingBag,
  ToggleLeft as Toggle,
  RefreshCcw,
  Minus,
  X,
  CreditCard,
  Wallet,
  Calendar,
  IndianRupee,
  Briefcase
} from 'lucide-react';
import { Table, MenuItem, UserRole, StockItem, Expense } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { firebaseConfig } from '../firebase';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminPage: React.FC = () => {
  const { 
    menuItems: allMenuItems, 
    tables: allTables, 
    orders, 
    stock,
    expenses,
    users,
    settings,
    seedData, 
    addTable, 
    deleteTable, 
    addMenuItem, 
    deleteMenuItem,
    updateStockItem,
    addExpense,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    updateGlobalSettings
  } = useStore();

  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const tables = allTables.filter(t => !t.deleted);
  const menuItems = allMenuItems.filter(i => !i.deleted);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'tables' | 'staff' | 'stock' | 'expenses'>('overview');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  
  // Form States
  const [newTable, setNewTable] = useState({ name: '', capacity: 4 });
  const [newMenuItem, setNewMenuItem] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    available: true
  });
  const [newStaff, setNewStaff] = useState({ email: '', password: '', role: 'waiter' as UserRole, name: '' });
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    description: '',
    amount: 0,
    category: 'Grocery',
    date: new Date().toISOString()
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Mgmt', icon: UtensilsCrossed },
    { id: 'tables', label: 'Tables', icon: Grid3X3 },
    { id: 'staff', label: 'Staff Mgmt', icon: Users },
    { id: 'stock', label: 'Inventory', icon: Package },
    { id: 'expenses', label: 'Finance', icon: Receipt },
  ];

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with initial tables and menu items. Proceed?")) {
      await seedData();
      alert("Database seeded successfully!");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError('');

    try {
      // Initialize a secondary app to create user without signing out the admin
      const secondaryApp = getApps().find(app => app.name === "Secondary") 
        || initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newStaff.email, newStaff.password);
      const user = userCredential.user;

      // Add to Firestore collections
      await setDoc(doc(db, 'users', user.uid), {
        email: newStaff.email,
        role: newStaff.role,
        name: newStaff.name,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      // Cleanup secondary app
      await secondaryAuth.signOut();
      
      setNewStaff({ email: '', password: '', role: 'waiter', name: '' });
      setShowAddStaff(false);
      alert("Staff member added successfully!");
    } catch (err: any) {
      console.error("Error adding staff:", err);
      setStaffError(err.message || "Failed to add staff member.");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleHandleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense(newExpense);
      setNewExpense({ description: '', amount: 0, category: 'Grocery', date: new Date().toISOString() });
      setShowAddExpense(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleUpdateStock = (item: StockItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateStockItem(item.id, { quantity: newQty });
  };

  const totalRevenue = orders.filter(o => o.status === 'billed').reduce((acc, o) => acc + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const lowStockItems = stock.filter(item => item.quantity < (item.minThreshold || 10));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-8">
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter">LAJJATDAR</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Management Suite</p>
          </div>

          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-4 mb-2">Main Menu</span>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                  )}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <nav className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-4 mb-2">Live Stations</span>
              <button
                onClick={() => navigate('/waiter')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-800 hover:text-orange-500 transition-all border border-transparent hover:border-orange-500/20"
              >
                <ShoppingBag size={20} />
                Waiter View
              </button>
              <button
                onClick={() => navigate('/chef')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-800 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"
              >
                <ChefHat size={20} />
                Chef View
              </button>
            </nav>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              Sign Out
            </button>
            <div className="p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black text-zinc-500 uppercase">Logged in as</span>
                 <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase">{profile?.role}</div>
               </div>
               <span className="text-sm font-black text-white block truncate">{profile?.name}</span>
               <span className="text-[10px] font-medium text-zinc-500 truncate block">{profile?.email}</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Analytics Overview</h2>
                  <p className="text-zinc-500 font-medium">Real-time performance metrics</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleSeed}
                    className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-zinc-700/50 flex items-center gap-2"
                  >
                    <RefreshCcw size={14} />
                    SEED DATA
                  </button>
                  <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm font-bold text-zinc-400">
                    Last 24 Hours
                  </div>
                </div>
              </div>

              {/* System Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={cn(
                  "p-6 rounded-3xl border flex items-center justify-between transition-all outline-none",
                  settings.waiterStationEnabled 
                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                    : "bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      settings.waiterStationEnabled ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {settings.waiterStationEnabled ? <Unlock size={24} /> : <Lock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-white">Global Waiter Access</h4>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {settings.waiterStationEnabled ? "STATION OPEN" : "STATION CLOSED"}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateGlobalSettings({ waiterStationEnabled: !settings.waiterStationEnabled })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95",
                      settings.waiterStationEnabled 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    )}
                  >
                    <Power size={16} />
                    {settings.waiterStationEnabled ? "SHUT DOWN" : "OPEN UP"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                  <TrendingUp className="text-emerald-500 mb-4" size={32} />
                  <span className="text-xs font-bold text-zinc-500 uppercase">Total Revenue</span>
                  <h3 className="text-3xl font-black text-white">₹{totalRevenue}</h3>
                </div>
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                  <Receipt className="text-blue-500 mb-4" size={32} />
                  <span className="text-xs font-bold text-zinc-500 uppercase">Total Orders</span>
                  <h3 className="text-3xl font-black text-white">{orders.length}</h3>
                </div>
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                  <Package className="text-orange-500 mb-4" size={32} />
                  <span className="text-xs font-bold text-zinc-500 uppercase">Stock Alerts</span>
                  <h3 className="text-3xl font-black text-white">{lowStockItems.length} Items</h3>
                </div>
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                  <UtensilsCrossed className="text-purple-500 mb-4" size={32} />
                  <span className="text-xs font-bold text-zinc-500 uppercase">Tables Active</span>
                  <h3 className="text-3xl font-black text-white">{tables.filter(t => t.status !== 'free').length}</h3>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8">
                <h3 className="text-xl font-black text-white mb-6">Recent Activity</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="border-b border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-widest">
                         <th className="pb-4">Order ID</th>
                         <th className="pb-4">Table</th>
                         <th className="pb-4">Waiter</th>
                         <th className="pb-4">Amount</th>
                         <th className="pb-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm font-medium">
                       {orders.length === 0 ? (
                         <tr><td colSpan={5} className="py-8 text-center text-zinc-700 italic">No activity recorded</td></tr>
                       ) : (
                         orders.slice(0, 5).map(order => (
                           <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                             <td className="py-4 text-zinc-400 font-mono capitalize">{order.id.slice(-6)}</td>
                             <td className="py-4 text-zinc-200">{order.tableName}</td>
                             <td className="py-4 text-zinc-200">{order.waiterName}</td>
                             <td className="py-4 text-white font-black">₹{order.totalAmount}</td>
                             <td className="py-4">
                               <span className={cn(
                                 "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                 order.status === 'billed' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                               )}>
                                 {order.status}
                               </span>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Menu Management</h2>
                  <p className="text-zinc-500 font-medium">Customize your offerings and pricing</p>
                </div>
                <button 
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Plus size={20} />
                  {showAddMenu ? "CANCEL" : "ADD NEW ITEM"}
                </button>
              </div>

              {showAddMenu && (
                <div className="bg-zinc-900 p-8 rounded-3xl border border-blue-500/30 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-black text-white">New Menu Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Item Name" 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                      value={newMenuItem.name}
                      onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})}
                    />
                    <select 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                      value={newMenuItem.category}
                      onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value as any})}
                    >
                      <option value="Starter">Starter</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Bread">Bread</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Price" 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                      value={newMenuItem.price || ''}
                      onChange={e => setNewMenuItem({...newMenuItem, price: Number(e.target.value)})}
                    />
                    <button 
                      onClick={async () => {
                        await addMenuItem(newMenuItem);
                        setShowAddMenu(false);
                        setNewMenuItem({ name: '', description: '', price: 0, category: 'Main Course', available: true });
                      }}
                      className="bg-blue-500 text-white font-black rounded-xl p-3 hover:bg-blue-600 transition-all"
                    >
                      SAVE ITEM
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {menuItems.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-600 font-bold italic">No menu items found. Seed data to start!</div>
                ) : (
                  menuItems.map(item => (
                    <div key={item.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 font-black">
                          {item.name[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-zinc-100">{item.name}</h4>
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xl font-black text-white">₹{item.price}</span>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-blue-500 transition-colors"><Edit3 size={18} /></button>
                          <button 
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Table Management</h2>
                  <p className="text-zinc-500 font-medium">Configure restaurant floor layout</p>
                </div>
                <button 
                  onClick={() => setShowAddTable(!showAddTable)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Plus size={20} />
                  {showAddTable ? "CANCEL" : "ADD TABLE"}
                </button>
              </div>

              {showAddTable && (
                <div className="bg-zinc-900 p-8 rounded-3xl border border-emerald-500/30 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-black text-white">New Table</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Table Name (e.g. Table 10)" 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      value={newTable.name}
                      onChange={e => setNewTable({...newTable, name: e.target.value})}
                    />
                    <input 
                      type="number" 
                      placeholder="Capacity" 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      value={newTable.capacity || ''}
                      onChange={e => setNewTable({...newTable, capacity: Number(e.target.value)})}
                    />
                    <button 
                      onClick={async () => {
                        await addTable({ ...newTable, status: 'free' });
                        setShowAddTable(false);
                        setNewTable({ name: '', capacity: 4 });
                      }}
                      className="bg-emerald-500 text-white font-black rounded-xl p-3 hover:bg-emerald-600 transition-all"
                    >
                      CREATE TABLE
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-600 font-bold italic">No tables defined. Seed initial data to begin.</div>
                ) : (
                  tables.map(table => (
                    <div key={table.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-zinc-800 rounded-2xl text-zinc-400 group-hover:text-emerald-500 transition-colors">
                          <Grid3X3 size={24} />
                        </div>
                        <button 
                          onClick={() => deleteTable(table.id)}
                          className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white">{table.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <UserPlus size={14} className="text-zinc-500" />
                          <span className="text-sm font-bold text-zinc-500">{table.capacity} Seats</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-4 border-t border-zinc-800 flex justify-between items-center">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                          table.status === 'free' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                        )}>
                          {table.status}
                        </span>
                        <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">EDIT DETAILS</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Staff Management</h2>
                  <p className="text-zinc-500 font-medium">Manage user accounts and shift statuses</p>
                </div>
                <button 
                  onClick={() => setShowAddStaff(!showAddStaff)}
                  className={cn(
                    "flex items-center gap-2 font-black px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95",
                    showAddStaff ? "bg-zinc-800 text-zinc-400" : "bg-blue-500 text-white shadow-blue-500/20"
                  )}
                >
                  <UserPlus size={20} />
                  {showAddStaff ? "CANCEL" : "ADD STAFF"}
                </button>
              </div>

              {showAddStaff && (
                <form onSubmit={handleAddStaff} className="bg-zinc-900 p-8 rounded-3xl border border-blue-500/30 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-black text-white">Add New Staff Member</h3>
                  
                  {staffError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                      <AlertTriangle size={20} />
                      {staffError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                      value={newStaff.name}
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                      value={newStaff.email}
                      onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                    />
                    <input 
                      type="password" 
                      placeholder="Initial Password" 
                      required
                      minLength={6}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                      value={newStaff.password}
                      onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                    />
                    <select 
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-black uppercase text-xs"
                      value={newStaff.role}
                      onChange={e => setNewStaff({...newStaff, role: e.target.value as UserRole})}
                    >
                      <option value="waiter">Waiter</option>
                      <option value="chef">Chef</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={staffLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {staffLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        CREATE ACCOUNT
                      </>
                    )}
                  </button>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest text-center italic">
                    Note: Creating an account will not sign you out.
                  </p>
                </form>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {users.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-600 font-bold italic">No staff profiles found. Wait for sync or add new!</div>
                ) : (
                  users.map(user => (
                    <div key={user.uid} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 font-black relative overflow-hidden">
                           {user.name ? user.name[0] : (user.email ? user.email[0] : '?')}
                           {user.status === 'inactive' && (
                             <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                               <Power size={14} className="text-red-500" />
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col min-w-0">
                           <h4 className={cn(
                            "font-black truncate transition-colors",
                            user.status === 'inactive' ? "text-zinc-600 line-through" : "text-zinc-100"
                          )}>
                            {user.name || 'Unnamed User'}
                          </h4>
                          <span className="text-[10px] font-bold text-zinc-500 truncate">{user.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Shift Toggle */}
                        <button 
                          onClick={() => updateUserStatus(user.uid, user.status === 'inactive' ? 'active' : 'inactive')}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                            user.status === 'inactive' 
                              ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" 
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                          )}
                          title={user.status === 'inactive' ? "Enable Shift" : "Disable Shift"}
                        >
                          <Power size={12} />
                          {user.status === 'inactive' ? "Inactive" : "Active"}
                        </button>

                        <select 
                          className={cn(
                            "bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer",
                            user.role === 'admin' ? "text-purple-500 border-purple-500/20" : 
                            user.role === 'chef' ? "text-blue-500 border-blue-500/20" : 
                            "text-orange-500 border-orange-500/20"
                          )}
                          value={user.role}
                          onChange={(e) => updateUserRole(user.uid, e.target.value as UserRole)}
                        >
                          <option value="waiter">Waiter</option>
                          <option value="chef">Chef</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button 
                          onClick={() => {
                            if (window.confirm(`Revoke all access for ${user.email}? This will remove their record from Firestore.`)) {
                              deleteUser(user.uid);
                            }
                          }}
                          className="p-2.5 rounded-lg bg-zinc-800 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Inventory Control</h2>
                  <p className="text-zinc-500 font-medium">Track grocery stock levels</p>
                </div>
              </div>
              
              {lowStockItems.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in duration-300">
                  <AlertTriangle className="text-orange-500" size={32} />
                  <div>
                    <h4 className="font-black text-orange-500">Low Stock Warning</h4>
                    <p className="text-sm text-orange-500/70 font-medium">
                      {lowStockItems.map(i => i.name).join(', ')} are below the safety threshold. Reorder soon!
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stock.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-zinc-600 font-bold italic">No inventory records. Seed data to begin.</div>
                ) : (
                  stock.map((item) => (
                    <div key={item.id} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col gap-4 group hover:border-orange-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-black text-white">{item.name}</h4>
                        <span className="text-xs font-black bg-zinc-800 text-zinc-500 px-2 py-1 rounded uppercase">{item.category}</span>
                      </div>
                      <div className="flex items-end justify-between">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Quantity</span>
                            <span className="text-3xl font-black text-white">{item.quantity} <span className="text-sm text-zinc-500">{item.unit}</span></span>
                         </div>
                         <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                            <button 
                              onClick={() => handleUpdateStock(item, -1)}
                              className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-red-500"
                            >
                              <Minus size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStock(item, 1)}
                              className="p-1.5 hover:bg-zinc-800 rounded-xl transition-colors text-orange-500"
                            >
                              <Plus size={16} />
                            </button>
                         </div>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500", 
                            item.quantity < (item.minThreshold || 10) ? "bg-orange-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min(100, (item.quantity / (item.minThreshold ? item.minThreshold * 2 : 20)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Finance & Reporting</h2>
                  <p className="text-zinc-500 font-medium">Detailed tracking of revenue and expenses</p>
                </div>
                <button 
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Plus size={20} />
                  ADD EXPENSE
                </button>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
                  <TrendingUp className="text-emerald-500" size={32} />
                  <div>
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Live Revenue</span>
                    <h3 className="text-4xl font-black text-white italic mt-1 tracking-tighter">₹{totalRevenue}</h3>
                  </div>
                  <p className="text-xs font-bold text-zinc-600 uppercase">Incoming from {orders.filter(o => o.status === 'billed').length} bills</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col gap-4 group hover:border-red-500/30 transition-all">
                  <CreditCard className="text-red-500" size={32} />
                  <div>
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Total Expenses</span>
                    <h3 className="text-4xl font-black text-white italic mt-1 tracking-tighter">₹{totalExpenses}</h3>
                  </div>
                  <p className="text-xs font-bold text-zinc-600 uppercase">Outgoing from {expenses.length} records</p>
                </div>
                <div className={cn(
                  "p-8 rounded-3xl border flex flex-col gap-4 transition-all",
                  netProfit >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                )}>
                  <div className={cn(
                    "p-3 w-fit rounded-2xl",
                    netProfit >= 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Net Profit</span>
                    <h3 className={cn(
                      "text-4xl font-black italic mt-1 tracking-tighter",
                      netProfit >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>₹{Math.abs(netProfit)}</h3>
                  </div>
                  <p className="text-xs font-bold text-zinc-600 uppercase">{netProfit >= 0 ? "SURPLUS" : "DEFICIT"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Billing History */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Billing History</h3>
                    <Receipt size={20} className="text-zinc-600" />
                  </div>
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {orders.filter(o => o.status === 'billed').length === 0 ? (
                      <div className="py-20 text-center text-zinc-700 italic font-bold">No bills generated yet.</div>
                    ) : (
                      orders.filter(o => o.status === 'billed').map(order => (
                        <div key={order.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-900 rounded-xl text-emerald-500">
                              <IndianRupee size={20} />
                            </div>
                            <div>
                               <h4 className="font-black text-zinc-200">{order.tableName}</h4>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                 <span>{format(new Date(order.updatedAt), 'MMM d, HH:mm')}</span>
                                 <span>•</span>
                                 <span>{order.waiterName}</span>
                               </div>
                            </div>
                          </div>
                          <span className="text-xl font-black text-white">₹{order.totalAmount}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Expense Log */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Expense Log</h3>
                    <CreditCard size={20} className="text-zinc-600" />
                  </div>
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {expenses.length === 0 ? (
                      <div className="py-20 text-center text-zinc-700 italic font-bold">No expenses recorded yet.</div>
                    ) : (
                      expenses.map(expense => (
                        <div key={expense.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between group hover:border-red-500/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-xl",
                              expense.category === 'Salary' ? "bg-purple-500/10 text-purple-500" :
                              expense.category === 'Utility' ? "bg-blue-500/10 text-blue-500" :
                              "bg-red-500/10 text-red-500"
                            )}>
                              {expense.category === 'Salary' ? <Briefcase size={20} /> : <Receipt size={20} />}
                            </div>
                            <div>
                               <h4 className="font-black text-zinc-200">{expense.description}</h4>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                 <span>{format(new Date(expense.date), 'MMM d, HH:mm')}</span>
                                 <span>•</span>
                                 <span className="italic">{expense.category}</span>
                               </div>
                            </div>
                          </div>
                          <span className="text-xl font-black text-white">₹{expense.amount}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Add Expense Modal */}
              {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-zinc-950/40 animate-in fade-in duration-200">
                  <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 shadow-2xl p-8 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white italic">Record Expense</h3>
                      <button 
                        onClick={() => setShowAddExpense(false)}
                        className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleHandleAddExpense} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                         <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Detail</label>
                         <input 
                            type="text" 
                            placeholder="e.g. Electricity Bill, Staff Salary" 
                            required
                            className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500 font-bold"
                            value={newExpense.description}
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                         />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                           <input 
                              type="number" 
                              placeholder="0.00" 
                              required
                              className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500 font-black h-full"
                              value={newExpense.amount || ''}
                              onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                           />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                           <select 
                              className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white focus:outline-none focus:border-emerald-500 font-black uppercase text-xs h-full"
                              value={newExpense.category}
                              onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                           >
                             <option value="Grocery">Grocery</option>
                             <option value="Utility">Utility</option>
                             <option value="Salary">Salary</option>
                             <option value="Maintenance">Maintenance</option>
                             <option value="Other">Other</option>
                           </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 mt-4"
                      >
                        RECORD TRANSACTION
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
