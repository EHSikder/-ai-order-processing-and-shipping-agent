
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import type { OrderDetails, InventoryStatus, ShippingInfo, ShippingConfirmation, InventoryItem } from '../types';

// Initialize the client lazily to ensure environment variables are ready.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey });
};

const model = 'gemini-2.5-flash';

// --- Inventory Database (MOCK DATA) ---
// [DEVELOPER NOTE]: This is a placeholder database. 
// To connect a real DB, see the instructions in checkInventory_simulated below.

export const INVENTORY_DATABASE: InventoryItem[] = [
  { id: '1', name: 'Sonic Screwdriver', price: 950.00, stock: 15 },
  { id: '2', name: 'Flux Capacitor', price: 4500.00, stock: 3 },
  { id: '3', name: 'Lightsaber', price: 12000.00, stock: 0 },
  { id: '4', name: 'Portal Gun', price: 5000.00, stock: 5 },
  { id: '5', name: 'Replicator', price: 25000.00, stock: 2 },
  { id: '6', name: 'Tardis Key', price: 50.00, stock: 100 },
  { id: '7', name: 'Neuralyzer', price: 120.00, stock: 42 },
  { id: '8', name: 'Plumbus', price: 49.99, stock: 999 },
  { id: '9', name: 'Hoverboard', price: 600.00, stock: 8 }
];

// --- Simulated Backend Functions ---

// [DEVELOPER INTEGRATION POINT]
// Replace the logic inside this function to query your real database or API.
const checkInventory_simulated = (itemQuery: string, quantity: number): InventoryStatus => {
  console.log(`DATABASE: Checking inventory for ${quantity} of "${itemQuery}"`);
  
  // --- START: Mock Logic (Replace this block) ---
  const normalizedQuery = itemQuery.toLowerCase();
  
  // Simple fuzzy matching: find item where name includes the query or query includes the name
  const foundItem = INVENTORY_DATABASE.find(dbItem => {
      const normalizedDbName = dbItem.name.toLowerCase();
      return normalizedDbName.includes(normalizedQuery) || normalizedQuery.includes(normalizedDbName);
  });

  if (!foundItem) {
      console.log(`DATABASE: Item "${itemQuery}" not found.`);
      return { available: false, pricePerItem: 0, detectedItemName: undefined };
  }

  const isAvailable = foundItem.stock >= quantity;
  console.log(`DATABASE: Found "${foundItem.name}". Stock: ${foundItem.stock}, Requested: ${quantity}. Available: ${isAvailable}`);

  return { 
      available: isAvailable, 
      pricePerItem: foundItem.price, 
      stockRemaining: foundItem.stock,
      detectedItemName: foundItem.name
  }; 
  // --- END: Mock Logic ---
};

const processShipping_simulated = async (
    item: string, 
    quantity: number, 
    address: string, 
    setShippingMessage: (msg: string) => void
): Promise<ShippingConfirmation> => {
  console.log(`SIMULATING: Processing shipping for ${quantity} ${item}(s) to ${address}`);
  
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  await wait(800);
  setShippingMessage("Validating shipping address...");
  await wait(1000);
  setShippingMessage("Processing secure payment...");
  await wait(1200);
  setShippingMessage(`Allocating inventory: ${quantity} x ${item}...`);
  await wait(1000);
  setShippingMessage("Picking and packing items...");
  await wait(1500);
  setShippingMessage("Generating shipping label...");
  await wait(1000);
  setShippingMessage("Package handed over to carrier.");

  const trackingId = '1Z' + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 4));
  
  const eta = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return { trackingId, eta };
};


// --- Gemini API Function Declarations ---

const checkInventoryTool: FunctionDeclaration = {
  name: 'checkInventory',
  description: 'Checks if a given quantity of an item is available in the inventory database and returns its price.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      item: { type: Type.STRING, description: 'The name of the item to check.' },
      quantity: { type: Type.NUMBER, description: 'The number of items to check for.' },
    },
    required: ['item', 'quantity'],
  },
};

const processShippingTool: FunctionDeclaration = {
  name: 'processShipping',
  description: 'Initiates the shipping process after approval.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      item: { type: Type.STRING, description: 'The name of the item being shipped.' },
      quantity: { type: Type.NUMBER, description: 'The quantity of the item being shipped.' },
      address: { type: Type.STRING, description: 'The full shipping address.' },
    },
    required: ['item', 'quantity', 'address'],
  },
};

// --- Exported Service Functions ---

export const extractOrderDetails = async (orderText: string): Promise<OrderDetails> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model,
    contents: `Extract the item, quantity, and shipping address from the following user order. Ensure the address is a plausible, complete shipping address. \n\nORDER: "${orderText}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: 'The product name.' },
          quantity: { type: Type.NUMBER, description: 'The number of items ordered.' },
          address: { type: Type.STRING, description: 'The full shipping address.' },
        },
        required: ['item', 'quantity', 'address'],
      },
    }
  });
  
  const text = response.text;
  if (!text) throw new Error("Failed to extract order details.");
  try {
    return JSON.parse(text);
  } catch (e) {
     console.error("JSON Parsing failed", e);
     throw new Error("AI returned invalid JSON for order details.");
  }
};

const callGeminiWithTools = async (prompt: string, tools: FunctionDeclaration[]): Promise<GenerateContentResponse> => {
    const ai = getAiClient();
    return ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ functionDeclarations: tools }],
        },
    });
};

export const checkInventory = async (item: string, quantity: number): Promise<InventoryStatus> => {
    const prompt = `Check the inventory for ${quantity} of the item "${item}".`;
    const response = await callGeminiWithTools(prompt, [checkInventoryTool]);

    const functionCall = response.functionCalls?.[0];
    if (functionCall?.name === 'checkInventory') {
        const args = functionCall.args as any; // Cast to any to safely access properties if types are loose
        return checkInventory_simulated(args.item, args.quantity);
    }
    // Fallback if model answers directly or fails to call tool
    throw new Error("AI failed to call the inventory check function.");
};

export const calculateShippingAndTotal = async (quantity: number, pricePerItem: number): Promise<ShippingInfo> => {
    const ai = getAiClient();
    const prompt = `
        Calculate the shipping fee and total cost for an order.
        
        Inputs:
        - Quantity: ${quantity}
        - Price Per Item: ${pricePerItem}
        
        Logic:
        1. Subtotal = Quantity * Price Per Item
        2. Shipping Fee = 5.99 + (1.50 * Quantity)
        3. Total Cost = Subtotal + Shipping Fee
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    shippingFee: { type: Type.NUMBER },
                    totalCost: { type: Type.NUMBER },
                },
                required: ['shippingFee', 'totalCost'],
            },
        }
    });
    
    const text = response.text;
    if (!text) throw new Error("Failed to calculate shipping costs.");

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error in calculateShippingAndTotal:", e, "Response text:", text);
        throw new Error("AI calculation failed to return valid data.");
    }
};

export const processShipping = async (
    item: string, 
    quantity: number, 
    address: string, 
    setShippingMessage: (msg: string) => void
): Promise<ShippingConfirmation> => {
    const prompt = `The user has approved the order. Initiate the shipping process for ${quantity} "${item}"(s) to the address "${address}".`;
    const response = await callGeminiWithTools(prompt, [processShippingTool]);

    const functionCall = response.functionCalls?.[0];
    if (functionCall?.name === 'processShipping') {
        const args = functionCall.args as any;
        return processShipping_simulated(
            args.item, 
            args.quantity, 
            args.address, 
            setShippingMessage
        );
    }
    throw new Error("AI failed to call the shipping process function.");
};
