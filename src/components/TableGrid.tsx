import React from 'react';
import { Table } from '../types';
import { User, Users, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'free': return 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 text-zinc-400';
      case 'occupied': return 'bg-orange-500/10 border-orange-500/30 text-orange-500';
      case 'dirty': return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'reserved': return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
      default: return 'bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div 
      onClick={() => onClick(table)}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden",
        getStatusColor(table.status)
      )}
    >
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
        {table.status === 'free' ? <CheckCircle2 size={40} /> : <Clock size={40} />}
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span className="text-sm font-medium uppercase tracking-widest opacity-60">
            {table.status}
        </span>
        <h3 className="text-3xl font-black">{table.name}</h3>
        <div className="flex items-center gap-1 opacity-80">
          <Users size={16} />
          <span className="text-sm font-bold">Cap: {table.capacity}</span>
        </div>
      </div>
    </div>
  );
};

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, onTableSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {tables.map(table => (
        <TableCard key={table.id} table={table} onClick={onTableSelect} />
      ))}
    </div>
  );
};

export default TableGrid;
