import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../components/AuthGuard';
import { ChefHat, Clock, CheckCircle2, AlertCircle, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ChefPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const chefName = profile?.name || profile?.email?.split('@')[0] || "Chef";

  const handleStatusUpdate = async (orderId: string, status: 'preparing' | 'ready') => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
    } catch (err) {
      console.error("Chef error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in fade-in duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <ChefHat className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">Kitchen Display</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Chef Station • {chefName}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Active</span>
                <span className="text-xl font-black text-white">{activeOrders.length}</span>
              </div>
              <div className="w-px h-8 bg-zinc-800 self-center"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Ready</span>
                <span className="text-xl font-black text-emerald-500">{readyOrders.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-black px-4 py-2 rounded-xl transition-all border border-blue-500/20"
                >
                  <LayoutDashboard size={18} />
                  <span className="text-xs uppercase tracking-widest hidden lg:inline">Back to Admin</span>
                </button>
              )}
              <button 
                onClick={logout}
                className="p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-700 gap-4">
              <ChefHat size={80} className="opacity-10" />
              <p className="text-xl font-bold tracking-tight italic">All orders served. Clear kitchen!</p>
            </div>
          ) : (
            activeOrders.map(order => (
              <div 
                key={order.id} 
                className={cn(
                  "flex flex-col bg-zinc-900 border-2 rounded-3xl overflow-hidden transition-all duration-500",
                  order.status === 'pending' ? "border-zinc-800" : "border-orange-500/30 shadow-lg shadow-orange-500/5"
                )}
              >
                {/* Order Header */}
                <div className={cn(
                  "p-4 flex flex-col gap-1 border-b",
                  order.status === 'pending' ? "bg-zinc-800/50 border-zinc-800" : "bg-orange-500/5 border-orange-500/20"
                )}>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black text-white">{order.tableName}</span>
                    <span className="text-xs font-black px-2 py-1 rounded bg-zinc-950 text-zinc-400">
                      ID: {order.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(order.createdAt))} ago
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-zinc-200 leading-none">
                          <span className="text-orange-500 mr-2">{item.quantity}×</span>
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-xs font-medium text-orange-400/80 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} />
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
                   {order.status === 'pending' ? (
                     <button 
                       disabled={updatingId === order.id}
                       onClick={() => handleStatusUpdate(order.id, 'preparing')}
                       className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-orange-500 hover:text-white disabled:opacity-50 text-zinc-400 font-bold py-3 rounded-xl transition-all active:scale-95"
                     >
                       {updatingId === order.id ? (
                         <Loader2 size={20} className="animate-spin" />
                       ) : (
                         "START PREPARING"
                       )}
                     </button>
                   ) : (
                     <button 
                       disabled={updatingId === order.id}
                       onClick={() => handleStatusUpdate(order.id, 'ready')}
                       className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                     >
                       {updatingId === order.id ? (
                         <Loader2 size={20} className="animate-spin" />
                       ) : (
                         <>
                           <CheckCircle2 size={20} />
                           MARK AS READY
                         </>
                       )}
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ChefPage;
