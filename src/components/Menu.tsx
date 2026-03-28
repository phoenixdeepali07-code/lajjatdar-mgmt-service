import React from 'react';
import { MenuItem } from '../types';
import { Plus, Minus, Info } from 'lucide-react';

interface MenuProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

const Menu: React.FC<MenuProps> = ({ items, onAddItem }) => {
  const categories: MenuItem['category'][] = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Bread', 'Rice'];

  return (
    <div className="flex flex-col gap-8">
      {categories.map(category => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-orange-500 uppercase tracking-widest border-l-4 border-orange-500 pl-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-zinc-100">{item.name}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p>
                    <span className="text-sm font-black text-orange-400">₹{item.price}</span>
                  </div>
                  <button 
                    onClick={() => onAddItem(item)}
                    className="p-3 rounded-full bg-zinc-800 text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Menu;
