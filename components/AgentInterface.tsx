
import React, { useState, useCallback, FC } from 'react';
import { ProcessStep, OrderDetails, InventoryStatus, ShippingInfo, ShippingConfirmation } from '../types';
import * as geminiService from '../services/geminiService';
import { UserInput } from './UserInput';
import { OrderStatus } from './OrderStatus';
import { IntegrationModal } from './IntegrationModal';

export const AgentInterface: FC = () => {
  const [processStep, setProcessStep] = useState<ProcessStep>(ProcessStep.INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const [orderText, setOrderText] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [shippingConfirmation, setShippingConfirmation] = useState<ShippingConfirmation | null>(null);
  const [shippingProgressMessage, setShippingProgressMessage] = useState<string>('');

  const resetState = () => {
    setProcessStep(ProcessStep.INITIAL);
    setIsLoading(false);
    setError(null);
    setOrderText('');
    setOrderDetails(null);
    setInventoryStatus(null);
    setShippingInfo(null);
    setShippingConfirmation(null);
    setShippingProgressMessage('');
  };

  const handleOrderSubmit = useCallback(async (newOrderText: string) => {
    resetState();
    setIsLoading(true);
    setOrderText(newOrderText);
    setError(null);

    try {
      // Step 1: Extract Order Details
      setProcessStep(ProcessStep.EXTRACTING);
      const extractedDetails = await geminiService.extractOrderDetails(newOrderText);
      setOrderDetails(extractedDetails);

      // Step 2: Check Inventory
      setProcessStep(ProcessStep.CHECKING_INVENTORY);
      const inventory = await geminiService.checkInventory(extractedDetails.item, extractedDetails.quantity);
      if (!inventory.available) {
        const msg = inventory.detectedItemName 
            ? `Sorry, we only have ${inventory.stockRemaining} "${inventory.detectedItemName}" in stock (you requested ${extractedDetails.quantity}).`
            : `Sorry, we don't have "${extractedDetails.item}" in our database.`;
        throw new Error(msg);
      }
      setInventoryStatus(inventory);

      // Step 3: Calculate Shipping & Total
      setProcessStep(ProcessStep.CALCULATING_SHIPPING);
      const shipping = await geminiService.calculateShippingAndTotal(extractedDetails.quantity, inventory.pricePerItem);
      setShippingInfo(shipping);

      // Step 4: Handle Approval
      if (extractedDetails.quantity > 3) {
        setProcessStep(ProcessStep.AWAITING_APPROVAL);
      } else {
        await handleApproval(extractedDetails, shipping);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
      setProcessStep(ProcessStep.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApproval = async (details?: OrderDetails, shipping?: ShippingInfo) => {
    const currentDetails = details || orderDetails;
    if (!currentDetails) {
        setError("Order details are missing.");
        setProcessStep(ProcessStep.ERROR);
        return;
    }

    setIsLoading(true);
    setError(null);
    setProcessStep(ProcessStep.SHIPPING);

    try {
      // Step 5: Process Shipping
      const confirmation = await geminiService.processShipping(
        currentDetails.item,
        currentDetails.quantity,
        currentDetails.address,
        setShippingProgressMessage
      );
      setShippingConfirmation(confirmation);
      setProcessStep(ProcessStep.COMPLETE);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred during shipping.");
      setProcessStep(ProcessStep.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 sm:p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-semibold text-slate-300 uppercase tracking-wider text-xs">Live Agent Test</h2>
             <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-400 font-mono">ONLINE</span>
             </div>
        </div>
        
        <UserInput onSubmit={handleOrderSubmit} isLoading={isLoading && processStep !== ProcessStep.SHIPPING} />
        
        {processStep !== ProcessStep.INITIAL && (
          <div className="mt-8 border-t border-slate-700/50 pt-8">
            <OrderStatus
              step={processStep}
              isLoading={isLoading}
              error={error}
              orderText={orderText}
              orderDetails={orderDetails}
              inventoryStatus={inventoryStatus}
              shippingInfo={shippingInfo}
              shippingConfirmation={shippingConfirmation}
              shippingProgressMessage={shippingProgressMessage}
              onApprove={() => handleApproval()}
              onReset={resetState}
            />
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button 
            onClick={() => setShowIntegrationModal(true)}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-slate-700 border border-slate-600 rounded-full hover:bg-slate-600 hover:border-cyan-500/50 transition-all shadow-lg"
        >
            <span className="mr-2">Integrate this Agent</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
        </button>
        <p className="mt-3 text-slate-500 text-sm">Get the code to embed this exact configuration on your site.</p>
      </div>

      <IntegrationModal isOpen={showIntegrationModal} onClose={() => setShowIntegrationModal(false)} />
    </>
  );
};
