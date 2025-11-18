
import React, { FC } from 'react';
import { InventoryItem } from '../types';

interface InventoryDisplayProps {
  inventory: InventoryItem[];
}

export const InventoryDisplay: FC<InventoryDisplayProps> = ({ inventory }) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            Warehouse Database
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                <tr>
                    <th scope="col" className="px-6 py-3">Item Name</th>
                    <th scope="col" className="px-6 py-3">Price</th>
                    <th scope="col" className="px-6 py-3 text-right">Stock</th>
                </tr>
            </thead>
            <tbody>
                {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                        <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                        <td className={`px-6 py-4 text-right font-mono ${item.stock === 0 ? 'text-red-400' : item.stock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {item.stock === 0 ? 'OUT OF STOCK' : item.stock}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
