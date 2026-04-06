import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../components/AuthGuard';
import { Table, MenuItem, Order, OrderItem } from '../types';
import TableGrid from '../components/TableGrid';
import Menu from '../components/Menu';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Send, 
  Trash2, 
  User, 
  ChevronRight, 
  Plus, 
  Minus, 
  Lock, 
  LogOut, 
  LayoutDashboard,
  Moon,
  Receipt,
  Utensils
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WaiterPage: React.FC = () => {
  const { tables: allTables, menuItems: allMenuItems, orders, addOrder, updateOrderStatus, settings } = useStore();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const tables = allTables.filter(t => !t.deleted);
  const menuItems = allMenuItems.filter(i => !i.deleted);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  const waiterName = profile?.name || profile?.email?.split('@')[0] || "Staff";

  // Find the active order for the selected table if it's occupied
  const activeOrder = selectedTable?.status === 'occupied' 
    ? orders.find(o => o.tableId === selectedTable.id && o.status !== 'billed') 
    : null;

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setCart([]);
    setIsAddingMore(false);
  };

  const handleBack = () => {
    setSelectedTable(null);
    setCart([]);
    setIsAddingMore(false);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuItemId === menuItemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      waiterName: waiterName,
      items: cart,
      status: 'pending',
      totalAmount: calculateTotal(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addOrder(newOrder);
    handleBack();
  };

  const handleGenerateBill = () => {
    if (activeOrder) {
      if (window.confirm(`Generate final bill for ${selectedTable?.name}? Total: ₹${activeOrder.totalAmount}`)) {
        updateOrderStatus(activeOrder.id, 'billed');
        handleBack();
      }
    }
  };

  // Case 1: Individual Shift Over (Waiter Profile Inactive)
  if (profile?.status === 'inactive' && profile?.role !== 'admin') {
     return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <Moon size={48} className="text-blue-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2 uppercase">Your Shift is Over</h2>
        <p className="text-zinc-500 max-w-sm font-medium">
          Hello {waiterName}, your profile has been set to inactive. Please contact your manager if you believe this is a mistake.
        </p>
        <button 
          onClick={logout}
          className="mt-8 flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold px-6 py-3 rounded-2xl border border-zinc-800 transition-all active:scale-95"
        >
          <LogOut size={20} />
          SIGN OUT
        </button>
      </div>
    );
  }

  // Case 2: Global Station Locked
  if (!settings.waiterStationEnabled && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <Lock size={48} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">STATION LOCKED</h2>
        <p className="text-zinc-500 max-w-sm font-medium">
          The Waiter Station has been temporarily disabled by the administrator. Please wait for the session to be opened.
        </p>
        <button 
          onClick={logout}
          className="mt-8 flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold px-6 py-3 rounded-2xl border border-zinc-800 transition-all active:scale-95"
        >
          <LogOut size={20} />
          SIGN OUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedTable && (
              <button 
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter">LAJJATDAR</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                WAITER • {waiterName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-black px-4 py-2 rounded-xl transition-all border border-blue-500/20"
              >
                <LayoutDashboard size={18} />
                <span className="text-xs uppercase tracking-widest hidden sm:inline">Admin Panel</span>
              </button>
            )}
            <button 
              onClick={logout}
              className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 pb-32 overflow-y-auto">
        {!selectedTable ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Select a Table</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-500">
                  {tables.filter(t => t.status === 'free').length} Available
                </span>
              </div>
            </div>
            <TableGrid tables={tables} onTableSelect={handleTableSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Main Content Area: Menu OR Table Summary */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {(!activeOrder || isAddingMore) ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">Menu</h2>
                      <ChevronRight className="text-zinc-700" size={20} />
                      <span className="text-xl font-bold text-orange-500">{selectedTable.name}</span>
                    </div>
                    {activeOrder && (
                      <button 
                        onClick={() => setIsAddingMore(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold px-4 py-2 rounded-xl text-xs transition-all"
                      >
                        VIEW CURRENT BILL
                      </button>
                    )}
                  </div>
                  <Menu items={menuItems} onAddItem={addToCart} />
                </>
              ) : (
                /* Billing / Summary View */
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-8 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-white">{selectedTable.name}</h2>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Current Session Summary</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1",
                         activeOrder.status === 'pending' ? "bg-orange-500/10 text-orange-500" :
                         activeOrder.status === 'preparing' ? "bg-blue-500/10 text-blue-500" :
                         "bg-emerald-500/10 text-emerald-500"
                       )}>
                         {activeOrder.status}
                       </span>
                       <span className="text-xs text-zinc-500 font-medium">
                         Started {formatDistanceToNow(new Date(activeOrder.createdAt))} ago
                       </span>
                    </div>
                  </div>

                  <div className="divide-y divide-zinc-800">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 font-black">
                            {item.quantity}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-200">{item.name}</h4>
                            <span className="text-xs text-zinc-500">₹{item.price} each</span>
                          </div>
                        </div>
                        <span className="font-black text-white">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-8 border-t border-zinc-800 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                       <h3 className="text-xl font-black text-zinc-500 uppercase tracking-widest">Total Bill</h3>
                       <span className="text-4xl font-black text-white tracking-tighter">₹{activeOrder.totalAmount}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <button 
                        onClick={() => setIsAddingMore(true)}
                        className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all"
                      >
                        <Utensils size={20} />
                        ADD MORE ITEMS
                      </button>
                      <button 
                        onClick={handleGenerateBill}
                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <Receipt size={20} />
                        GENERATE BILL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Cart Section (Only visible when adding more) */}
            <div className="relative">
              <div className="sticky top-24 flex flex-col gap-4 bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-orange-500" />
                    <h3 className="text-lg font-black text-white">{isAddingMore ? "Add to Order" : "New Items"}</h3>
                  </div>
                  <span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                    {cart.length} items
                  </span>
                </div>

                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-600 gap-2 font-medium">
                      <ShoppingBag size={48} className="opacity-10" />
                      <p className="text-sm italic">Nothing in cart yet</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.menuItemId} className="flex flex-col gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800/50 group">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-zinc-200">{item.name}</span>
                          <button 
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-black text-orange-400">₹{item.price * item.quantity}</span>
                          <div className="flex items-center gap-3 bg-zinc-900 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.menuItemId, -1)}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.menuItemId, 1)}
                              className="p-1 hover:bg-zinc-800 rounded transition-colors text-orange-500"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="mt-4 flex flex-col gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Additional Total</span>
                      <span className="text-2xl font-black text-white tracking-tighter">₹{calculateTotal()}</span>
                    </div>
                    
                    <button 
                      onClick={handleSubmitOrder}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                      <Send size={20} />
                      {isAddingMore ? "UPDATE KITCHEN" : "SEND TO KITCHEN"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WaiterPage;
