
import React from 'react';

export const IntegrationGuide = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 font-mono text-sm text-slate-300">
      <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        Database Integration Steps
      </h3>
      
      <div className="space-y-6">
        <div>
            <p className="mb-2 font-semibold text-slate-200">1. Locate the Service File</p>
            <p>Open <code className="bg-slate-800 px-1 py-0.5 rounded text-yellow-300">services/geminiService.ts</code>.</p>
        </div>

        <div>
            <p className="mb-2 font-semibold text-slate-200">2. Find the Mock Function</p>
            <p>Search for the function <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">checkInventory_simulated</code>. This currently uses a hardcoded JSON array.</p>
        </div>

        <div>
            <p className="mb-2 font-semibold text-slate-200">3. Replace with API Call</p>
            <p className="mb-2">Replace the function body with a call to your actual backend or database API. For example:</p>
            
            <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800">
<pre><code className="language-typescript">{`const checkInventory_simulated = async (itemQuery, quantity) => {
  // TODO: Connect your real API here
  try {
    const response = await fetch(\`https://api.your-domain.com/inventory?item=\${itemQuery}\`);
    const data = await response.json();

    // Map your API response to the expected interface
    return {
      available: data.stock >= quantity,
      pricePerItem: data.current_price,
      stockRemaining: data.stock,
      detectedItemName: data.product_name
    };
  } catch (error) {
    console.error("API Error", error);
    return { available: false, pricePerItem: 0 };
  }
};`}</code></pre>
            </div>
        </div>

        <div>
             <p className="mb-2 font-semibold text-slate-200">4. (Optional) Update Shipping Logic</p>
             <p>You can also customize <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">processShipping_simulated</code> to trigger your real fulfillment webhook (e.g., Stripe, Shopify, or FedEx API).</p>
        </div>
      </div>
    </div>
  );
};
