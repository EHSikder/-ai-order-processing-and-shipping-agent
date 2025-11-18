
export enum ProcessStep {
  INITIAL = 'INITIAL',
  EXTRACTING = 'EXTRACTING',
  CHECKING_INVENTORY = 'CHECKING_INVENTORY',
  CALCULATING_SHIPPING = 'CALCULATING_SHIPPING',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  SHIPPING = 'SHIPPING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum AppView {
  AUTH = 'AUTH',
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD'
}

export interface OrderDetails {
  item: string;
  quantity: number;
  address: string;
}

export interface InventoryStatus {
  available: boolean;
  pricePerItem: number;
  stockRemaining?: number;
  detectedItemName?: string;
}

export interface ShippingInfo {
  shippingFee: number;
  totalCost: number;
}

export interface ShippingConfirmation {
  trackingId: string;
  eta: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock: number;
}
