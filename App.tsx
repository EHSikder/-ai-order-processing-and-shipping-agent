
import React, { useState, useCallback, FC } from 'react';
import { ProcessStep, OrderDetails, InventoryStatus, ShippingInfo, ShippingConfirmation } from './types';
import * as geminiService from './services/geminiService';
import { UserInput } from './components/UserInput';
import { OrderStatus } from './components/OrderStatus';

const App: FC = () => {
  const [processStep, setProcessStep] = useState<ProcessStep>(ProcessStep.INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            AI Order Agent
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            Smart fulfillment powered by Gemini.
          </p>
        </header>

        <main className="bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 sm:p-8">
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
        </main>

        <footer className="text-center text-slate-600 text-xs mt-12">
           <p>Powered by Google Gemini</p>
        </footer>

      </div>
    </div>
  );
};

export default App;
