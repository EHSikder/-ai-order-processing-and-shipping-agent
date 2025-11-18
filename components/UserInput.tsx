
import React, { useState, FC } from 'react';

interface UserInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const UserInput: FC<UserInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const examples = [
    "I need 3 sonic screwdrivers shipped to 123 Gallifrey Lane, Time Vortex, TV 54321",
    "Please send 5 flux capacitors to 88 MPH Hill Valley, CA 95420",
    "Order 10 lightsabers for delivery to 789 Jedi Temple, Coruscant, Galactic Core 00001",
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Send 2 portal guns to C-137, Citadel of Ricks..."
            className="w-full p-4 pr-28 bg-slate-700 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-slate-100"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-cyan-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-cyan-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </form>
      <div className="mt-4 text-sm text-slate-400">
        <span className="font-semibold">Try an example:</span>
        <div className="flex flex-wrap gap-2 mt-2">
            {examples.map((ex, i) => (
                <button
                    key={i}
                    onClick={() => handleExampleClick(ex)}
                    disabled={isLoading}
                    className="bg-slate-700/50 hover:bg-slate-700 px-3 py-1 rounded-md text-xs transition-colors disabled:opacity-50"
                >
                    Example {i+1}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
