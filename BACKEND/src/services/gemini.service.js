import {ai} from "../config/gemini.js";
import { Type } from "@google/genai";

/**
 * 1. AI Receipt OCR Scanner
 * Extracts structured line items, quantities, and prices from receipt image buffers.
 */
export const parseReceiptImage = async (imageBuffer, mimeType = "image/jpeg") => {

  const prompt = `Analyze this purchase receipt/bill image and extract all inventory line items accurately. 
                If SKU or tax rate is not explicitly printed, make a reasonable estimate or leave SKU empty. Return only structured JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        }
      },
      { text: prompt }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendorName: { type: Type.STRING },
          billDate: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sku: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                costPrice: { type: Type.NUMBER },
                taxRate: { type: Type.NUMBER },
                totalAmount: { type: Type.NUMBER }
              },
              required: ["name", "quantity", "costPrice"]
            }
          },
          totalBillAmount: { type: Type.NUMBER }
        },
        required: ["items"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * 2. Natural Language Sales Analytics (Text-to-Query)
 * Converts plain text user queries into a MongoDB aggregation pipeline array.
 */
export const generateMongoPipeline = async (userQuery, invoiceSchemaContext) => {
  const systemInstruction = `You are an expert MongoDB data engineer for a multi-tenant inventory SaaS.
Convert user natural-language questions about sales, revenue, or invoices into a valid MongoDB aggregation pipeline array.

CRITICAL RULES:
1. Do NOT include tenant filter stages (shopId filtering is applied automatically by the backend).
2. Use standard MongoDB aggregation operators ($match, $group, $sort, $project, $unwind, $facet).
3. Return ONLY a JSON array representing the aggregation stages.

Invoice Mongoose Schema Context:
${invoiceSchemaContext}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `User Query: "${userQuery}"\nGenerate the MongoDB aggregation pipeline array for this query.`
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
};

/**
 * 3. Smart Demand & Low-Stock Forecasting
 * Analyzes historical sales velocity and predicts depletion dates and reorder amounts.
 */
export const analyzeDemandForecast = async (salesVelocityData) => {
  const prompt = `Analyze the following product stock levels and 30-day sales velocity data.
Predict the number of days remaining until stockout and recommend reorder quantities.

Sales Velocity Data:
${JSON.stringify(salesVelocityData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysisSummary: { type: Type.STRING },
          forecasts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                productId: { type: Type.STRING },
                productName: { type: Type.STRING },
                currentStock: { type: Type.NUMBER },
                dailyRunRate: { type: Type.NUMBER },
                daysUntilStockout: { type: Type.NUMBER },
                recommendedReorderQuantity: { type: Type.NUMBER },
                urgencyLevel: {
                  type: Type.STRING,
                  enum: ["CRITICAL", "MODERATE", "HEALTHY"]
                },
                insights: { type: Type.STRING }
              },
              required: [
                "productId",
                "productName",
                "daysUntilStockout",
                "recommendedReorderQuantity",
                "urgencyLevel"
              ]
            }
          }
        },
        required: ["forecasts", "analysisSummary"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * 4. Dynamic Pricing & Bundling Recommender
 * Pairs slow-moving/dead inventory with high-velocity items with bundle discount strategies.
 */
export const generateBundleDiscounts = async (deadStockItems, topSellingItems) => {
  const prompt = `You are a retail revenue optimization expert.
Recommend strategic bundle promotions to clear slow-moving inventory by pairing them with top-selling products.

Slow Moving Inventory:
${JSON.stringify(deadStockItems, null, 2)}

Top Selling Items:
${JSON.stringify(topSellingItems, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bundles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bundleTitle: { type: Type.STRING },
                slowMovingProductId: { type: Type.STRING },
                slowMovingProductName: { type: Type.STRING },
                anchorProductId: { type: Type.STRING },
                anchorProductName: { type: Type.STRING },
                suggestedDiscountPercent: { type: Type.NUMBER },
                marketingPitch: { type: Type.STRING },
                expectedClearanceSpeed: {
                  type: Type.STRING,
                  enum: ["HIGH", "MEDIUM"]
                }
              },
              required: [
                "bundleTitle",
                "slowMovingProductId",
                "anchorProductId",
                "suggestedDiscountPercent",
                "marketingPitch"
              ]
            }
          }
        },
        required: ["bundles"]
      }
    }
  });

  return JSON.parse(response.text);
};