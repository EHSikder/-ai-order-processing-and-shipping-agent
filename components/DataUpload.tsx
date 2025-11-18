
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import * as geminiService from '../services/geminiService';

interface DataUploadProps {
  onComplete: () => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onComplete }) => {
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Updated template to be plain text instead of JSON
  const templateData = `Sonic Screwdriver, 950.00, 15
Flux Capacitor, 4500.00, 3
Lightsaber, 12000.00, 0
Quantum Processor, 1299.99, 50
Holographic Display, 499.50, 12`;

  const handleUseTemplate = () => {
    setInputData(templateData);
    setError(null);
  };

  const handleContinue = () => {
    try {
      if (!inputData.trim()) {
        setError("Please provide data or use the template.");
        return;
      }

      const lines = inputData.split('\n');
      const inventory: InventoryItem[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // Skip empty lines

        // Split by comma
        const parts = trimmedLine.split(',');

        if (parts.length < 3) {
           // If commas fail, try splitting by last two spaces (fallback for "Item Name Price Stock")
           // But let's stick to encouraging commas for better name handling
           errors.push(`Line ${index + 1}: Format must be "Name, Price, Stock"`);
           return;
        }

        // Extract parts (Last two are assumed to be Price and Stock, everything before is Name)
        // This handles cases like "Super Cool Widget, 10, 5" easily
        // But also allows "Widget, Blue, 10, 5" if we just take the last 2 as numbers.
        
        // Let's stick to strict 3 parts split by comma to be safe with the user instructions
        // Name can contain anything except the separator.
        
        const stockStr = parts.pop()?.trim() || '';
        const priceStr = parts.pop()?.trim() || '';
        const name = parts.join(',').trim(); // Rejoin the rest as name in case name had commas (unlikely but safe)

        const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        const stock = parseInt(stockStr.replace(/[^0-9]/g, ''), 10);

        if (!name || isNaN(price) || isNaN(stock)) {
            errors.push(`Line ${index + 1}: Invalid number format for Price or Stock.`);
            return;
        }

        inventory.push({
            id: String(index + 1),
            name,
            price,
            stock
        });
      });

      if (errors.length > 0) {
        // Show the first error to help guide them
        throw new Error(errors[0]);
      }

      if (inventory.length === 0) {
        throw new Error("No valid items found. Please enter data in 'Name, Price, Stock' format.");
      }

      // Update Service
      geminiService.updateInventoryDatabase(inventory);
      onComplete();

    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="w-full max-w-3xl p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Inventory</h2>
        <p className="text-slate-400">
            Upload your product database to train the agent.
        </p>
        <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-sm font-semibold text-cyan-400 mb-1">Required Format:</p>
            <p className="text-sm text-slate-300">Name, Price, Stock</p>
            <p className="text-xs text-slate-500 mt-1">(Enter one item per line)</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
            <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={`Example:\nWidget A, 10.00, 5\nSuper Gadget, 299.99, 100\n...`}
                className="w-full h-64 p-4 bg-slate-900 border-2 border-slate-600 rounded-xl font-mono text-sm text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none leading-relaxed"
            />
            <button 
                onClick={handleUseTemplate}
                className="absolute top-4 right-4 text-xs bg-slate-700 hover:bg-slate-600 text-cyan-300 px-3 py-1.5 rounded border border-slate-600 transition-colors"
            >
                Load Template Data
            </button>
        </div>

        {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </div>
        )}

        <div className="flex justify-end pt-4">
            <button
                onClick={handleContinue}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
            >
                Initialize Agent
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};
