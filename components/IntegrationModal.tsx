
import React from 'react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const embedCode = `<script>
  window.AI_AGENT_ID = "YOUR_UNIQUE_ID";
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://cdn.ai-fulfillment-agent.com/widget.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'ai-agent-sdk'));
</script>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Integrate Chatbot</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-6 space-y-6">
            <p className="text-slate-300">
                Your agent is trained on your uploaded data. To add this exact chatbot to your website, copy and paste the code snippet below into your HTML <code className="text-cyan-400 text-sm">&lt;body&gt;</code> tag.
            </p>
            
            <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-lg text-xs text-slate-300 font-mono overflow-x-auto border border-slate-800">
                    {embedCode}
                </pre>
                <button 
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs px-3 py-1 rounded border border-slate-700 transition-colors"
                    onClick={() => navigator.clipboard.writeText(embedCode)}
                >
                    Copy
                </button>
            </div>

            <div className="flex gap-4 p-4 bg-cyan-900/20 border border-cyan-800 rounded-lg">
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-200">Webhook Integration</h4>
                    <p className="text-xs text-slate-400 mt-1">To handle real payments and shipping, configure your webhook URL in the dashboard settings after integration.</p>
                </div>
            </div>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
            <button onClick={onClose} className="text-slate-300 hover:text-white font-medium text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};
