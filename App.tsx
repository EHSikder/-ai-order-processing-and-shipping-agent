
import React, { useState, FC } from 'react';
import { AppView } from './types';
import { AuthScreen } from './components/AuthScreen';
import { DataUpload } from './components/DataUpload';
import { AgentInterface } from './components/AgentInterface';

const App: FC = () => {
  const [view, setView] = useState<AppView>(AppView.AUTH);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
       
       {/* Header */}
      <header className="w-full p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">Fulfill<span className="text-cyan-400">AI</span></h1>
            </div>
            
            {view === AppView.DASHBOARD && (
                 <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">Logged in as <span className="text-slate-200">demo@user.com</span></span>
                    <button onClick={() => setView(AppView.AUTH)} className="text-slate-500 hover:text-white transition-colors">Sign Out</button>
                 </div>
            )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-4xl z-0 mx-auto">
            {view === AppView.AUTH && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AuthScreen onComplete={() => setView(AppView.UPLOAD)} />
                </div>
            )}

            {view === AppView.UPLOAD && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DataUpload onComplete={() => setView(AppView.DASHBOARD)} />
                </div>
            )}

            {view === AppView.DASHBOARD && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-100">Your Agent is Ready</h2>
                        <p className="text-slate-400 mt-2">Test the agent below using the data you just uploaded.</p>
                    </div>
                    <AgentInterface />
                </div>
            )}
        </div>
      </main>
      
      {view !== AppView.DASHBOARD && (
        <footer className="p-6 text-center text-slate-600 text-xs">
            <p>&copy; 2024 FulfillAI. Powered by Google Gemini.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
