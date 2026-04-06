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
  RefreshCcw
} from 'lucide-react';
import { Table, MenuItem, UserRole } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { firebaseConfig } from '../firebase';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminPage: React.FC = () => {
  const { 
    menuItems: allMenuItems, 
    tables: allTables, 
    orders, 
    users,
    settings,
    seedData, 
    addTable, 
    deleteTable, 
    addMenuItem, 
    deleteMenuItem,
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

  const totalRevenue = orders.filter(o => o.status === 'billed').reduce((acc, o) => acc + o.totalAmount, 0);

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
                  <h3 className="text-3xl font-black text-white">3 Items</h3>
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
              
              <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl flex items-center gap-4">
                <AlertTriangle className="text-orange-500" size={32} />
                <div>
                  <h4 className="font-black text-orange-500">Low Stock Warning</h4>
                  <p className="text-sm text-orange-500/70 font-medium">Onions and Chicken are below the safety threshold. Reorder soon!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Chicken', 'Paneer', 'Onions', 'Butter'].map((name, i) => (
                   <div key={i} className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-black text-white">{name}</h4>
                        <span className="text-xs font-black bg-zinc-800 text-zinc-500 px-2 py-1 rounded">Vegetables</span>
                      </div>
                      <div className="flex items-end justify-between">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Quantity</span>
                            <span className="text-3xl font-black text-white">{20 - (i * 5)} <span className="text-sm text-zinc-500">kg</span></span>
                         </div>
                         <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full", (20 - i*5) < 10 ? "bg-orange-500" : "bg-emerald-500")}
                              style={{ width: `${(20 - i*5)/20 * 100}%` }}
                            ></div>
                         </div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
             <div className="flex flex-col gap-8">
               <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-white italic">Financial Tally</h2>
                    <p className="text-zinc-500 font-medium">Compare input vs output expenses</p>
                  </div>
                  <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    <Plus size={20} />
                    ADD EXPENSE
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col gap-4">
                     <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Revenue (Input)</span>
                     <h4 className="text-4xl font-black text-emerald-500">₹{totalRevenue}</h4>
                     <p className="text-sm font-medium text-zinc-500">Total income from billed orders today.</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col gap-4">
                     <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Expenses (Output)</span>
                     <h4 className="text-4xl font-black text-red-500">₹4,200</h4>
                     <p className="text-sm font-medium text-zinc-500">Total spending on groceries and utilities.</p>
                  </div>
               </div>

               <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-black text-white">Net Profit</h4>
                    <span className="text-2xl font-black text-white">₹{totalRevenue - 4200}</span>
                  </div>
                  <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden flex">
                     <div className="h-full bg-emerald-500" style={{ width: '70%' }}></div>
                     <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
                  </div>
                  <div className="flex justify-between mt-4 text-xs font-bold">
                     <div className="flex items-center gap-2 text-emerald-500">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        Profit (70%)
                     </div>
                     <div className="flex items-center gap-2 text-red-500">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Expenses (30%)
                     </div>
                  </div>
               </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
