
import React, { FC } from 'react';
import { ProcessStep, OrderDetails, InventoryStatus, ShippingInfo, ShippingConfirmation } from '../types';
import { Spinner } from './Spinner';
import { ArchiveBoxIcon, CalculatorIcon, CheckCircleIcon, DocumentTextIcon, ExclamationTriangleIcon, TruckIcon } from './icons/Icons';

interface OrderStatusProps {
  step: ProcessStep;
  isLoading: boolean;
  error: string | null;
  orderText: string;
  orderDetails: OrderDetails | null;
  inventoryStatus: InventoryStatus | null;
  shippingInfo: ShippingInfo | null;
  shippingConfirmation: ShippingConfirmation | null;
  shippingProgressMessage: string;
  onApprove: () => void;
  onReset: () => void;
}

const Step: FC<{
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isComplete: boolean;
  children?: React.ReactNode;
}> = ({ icon, title, isActive, isComplete, children }) => {
  const baseRingClass = "absolute top-0 left-0 w-full h-full rounded-full";
  const ringClass = isComplete ? 'ring-2 ring-green-500' : isActive ? 'ring-2 ring-cyan-500' : 'ring-2 ring-slate-600';
  const iconColor = isComplete ? 'text-green-400' : isActive ? 'text-cyan-400' : 'text-slate-500';

  return (
    <li className="flex gap-4">
      <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
        <div className={`${baseRingClass} ${ringClass}`}></div>
        {isActive && <div className={`${baseRingClass} ${ringClass} animate-ping`}></div>}
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="pt-2.5">
        <h3 className={`font-bold ${isActive || isComplete ? 'text-slate-100' : 'text-slate-500'}`}>{title}</h3>
        <div className="text-slate-400 text-sm mt-1">{children}</div>
      </div>
    </li>
  );
};


export const OrderStatus: FC<OrderStatusProps> = ({
  step,
  isLoading,
  error,
  orderText,
  orderDetails,
  inventoryStatus,
  shippingInfo,
  shippingConfirmation,
  shippingProgressMessage,
  onApprove,
  onReset,
}) => {

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const stepsOrder = [
    ProcessStep.EXTRACTING,
    ProcessStep.CHECKING_INVENTORY,
    ProcessStep.CALCULATING_SHIPPING,
    ProcessStep.AWAITING_APPROVAL,
    ProcessStep.SHIPPING,
    ProcessStep.COMPLETE
  ];
  const currentStepIndex = stepsOrder.indexOf(step);

  if (step === ProcessStep.ERROR) {
    return (
        <div className="text-center p-6 bg-red-900/20 border border-red-500 rounded-lg">
            <div className="mx-auto bg-red-500/20 w-12 h-12 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400"/>
            </div>
            <h3 className="mt-4 text-xl font-bold text-red-400">An Error Occurred</h3>
            <p className="mt-2 text-red-300">{error}</p>
            <button
                onClick={onReset}
                className="mt-6 bg-red-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-red-500 transition-colors"
            >
                Start Over
            </button>
        </div>
    );
  }

  return (
    <div>
        <h2 className="text-2xl font-bold mb-2 text-slate-100">Order Progress</h2>
        <p className="text-slate-400 mb-6 italic">"{orderText}"</p>
        <ul className="space-y-6">
            <Step 
                icon={<DocumentTextIcon/>} 
                title="Extracting Order Details"
                isActive={step === ProcessStep.EXTRACTING}
                isComplete={currentStepIndex > 0}
            >
                {step === ProcessStep.EXTRACTING && <Spinner text="AI is reading your order..." />}
                {orderDetails && (
                    <div className="p-3 bg-slate-700/50 rounded-md mt-2">
                        <p><strong>Item:</strong> {orderDetails.item}</p>
                        <p><strong>Quantity:</strong> {orderDetails.quantity}</p>
                        <p><strong>Address:</strong> {orderDetails.address}</p>
                    </div>
                )}
            </Step>

            <Step 
                icon={<ArchiveBoxIcon/>} 
                title="Checking Inventory"
                isActive={step === ProcessStep.CHECKING_INVENTORY}
                isComplete={currentStepIndex > 1}
            >
                {step === ProcessStep.CHECKING_INVENTORY && <Spinner text="Contacting warehouse..." />}
                {inventoryStatus && (
                    <div className="p-3 bg-slate-700/50 rounded-md mt-2">
                       <p className="text-green-400 font-semibold">In Stock!</p>
                       <p><strong>Price/item:</strong> {formatCurrency(inventoryStatus.pricePerItem)}</p>
                    </div>
                )}
            </Step>
            
            <Step 
                icon={<CalculatorIcon/>} 
                title="Calculating Costs"
                isActive={step === ProcessStep.CALCULATING_SHIPPING}
                isComplete={currentStepIndex > 2}
            >
                {step === ProcessStep.CALCULATING_SHIPPING && <Spinner text="Calculating fees and totals..." />}
                {shippingInfo && (
                     <div className="p-3 bg-slate-700/50 rounded-md mt-2">
                       <p><strong>Shipping Fee:</strong> {formatCurrency(shippingInfo.shippingFee)}</p>
                       <p><strong>Total Cost:</strong> <span className="font-bold">{formatCurrency(shippingInfo.totalCost)}</span></p>
                    </div>
                )}
            </Step>
            
             <Step 
                icon={<CheckCircleIcon/>} 
                title="Awaiting Approval"
                isActive={step === ProcessStep.AWAITING_APPROVAL}
                isComplete={currentStepIndex > 3}
            >
                {step === ProcessStep.AWAITING_APPROVAL && (
                     <div className="p-3 bg-cyan-900/30 border border-cyan-700 rounded-md mt-2">
                        <p className="font-semibold text-cyan-300">This is a bulk order and requires your approval to proceed.</p>
                        <div className="mt-4 flex gap-4">
                            <button onClick={onApprove} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Approve Order
                            </button>
                            <button onClick={onReset} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {currentStepIndex > 3 && (
                    <p className="text-green-400 font-semibold">Order Approved!</p>
                )}
            </Step>

            <Step 
                icon={<TruckIcon/>} 
                title="Shipping"
                isActive={step === ProcessStep.SHIPPING}
                isComplete={step === ProcessStep.COMPLETE}
            >
                 {step === ProcessStep.SHIPPING && <Spinner text={shippingProgressMessage || 'Initiating shipping...'} />}
                 {shippingConfirmation && (
                    <div className="p-3 bg-slate-700/50 rounded-md mt-2">
                        <p className="text-green-400 font-semibold">Shipment Complete!</p>
                        <p><strong>Tracking ID:</strong> <span className="font-mono bg-slate-900 px-2 py-1 rounded">{shippingConfirmation.trackingId}</span></p>
                        <p><strong>Estimated Arrival:</strong> {shippingConfirmation.eta}</p>
                    </div>
                 )}
            </Step>
        </ul>
        {step === ProcessStep.COMPLETE && (
            <div className="text-center mt-8">
                <button
                    onClick={onReset}
                    className="bg-cyan-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    Place Another Order
                </button>
            </div>
        )}
    </div>
  );
};
