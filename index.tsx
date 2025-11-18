import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} catch (error) {
    console.error("Failed to mount application:", error);
    rootElement.innerHTML = `<div style="color: #f87171; padding: 2rem; text-align: center; font-family: sans-serif;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Failed to Load</h1>
        <p style="background: #450a0a; padding: 1rem; border-radius: 0.5rem; display: inline-block; text-align: left;">
            ${error instanceof Error ? error.message : String(error)}
        </p>
        <p style="margin-top: 1rem; color: #9ca3af;">Check the console for more details.</p>
    </div>`;
}