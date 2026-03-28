import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
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
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminPage: React.FC = () => {
  const { menuItems, tables, orders, seedData } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'stock' | 'expenses'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Mgmt', icon: UtensilsCrossed },
    { id: 'stock', label: 'Inventory', icon: Package },
    { id: 'expenses', label: 'Finance', icon: Receipt },
  ];

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with initial tables and menu items. Proceed?")) {
      await seedData();
      alert("Database seeded successfully!");
    }
  };

  const totalRevenue = orders.filter(o => o.status === 'billed').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Sidebar / Top Nav for Mobile */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="w-full lg:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-8">
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter">ADMIN PANEL</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Management Suite</p>
          </div>

          <nav className="flex flex-col gap-2">
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

          <div className="mt-auto">
            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
              <span className="text-xs font-bold text-zinc-500 uppercase">System Status</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-black text-zinc-300">ONLINE</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
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
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold px-4 py-2 rounded-xl text-sm transition-all border border-zinc-700/50"
                  >
                    SEED INITIAL DATA
                  </button>
                  <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm font-bold text-zinc-400">
                    Last 24 Hours
                  </div>
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
                <h3 className="text-xl font-black text-white mb-6">Recent Transactions</h3>
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
                         <tr><td colSpan={5} className="py-8 text-center text-zinc-700 italic">No transactions found</td></tr>
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
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-white italic">Menu Management</h2>
                  <p className="text-zinc-500 font-medium">Customize your offerings and pricing</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  <Plus size={20} />
                  ADD NEW ITEM
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {menuItems.map(item => (
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
                         <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {/* Mock stock display */}
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
