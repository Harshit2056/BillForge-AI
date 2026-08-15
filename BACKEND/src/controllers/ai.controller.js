import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js"
import { apiResponse } from "../utils/apiResponse.js";
import {Product} from "../models/Product.js";
import {Invoice} from "../models/Invoice.js";
import {
  parseReceiptImage,
  generateMongoPipeline,
  analyzeDemandForecast,
  generateBundleDiscounts
} from "../services/geminiService.js";



/**
 * 1. AI Receipt OCR Scanner
 * @desc    Extracts line items, quantities, and pricing from physical receipt image
 * @route   POST /api/v1/ai/scan-receipt
 * @access  Protected (Owner, Admin, Manager)
 */
export const scanReceiptOCR = asyncHandler(async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json(new apiResponse(400,{},"Please upload a receipt image file."));
    }

    // Process memory buffer directly with Gemini Vision API
    const extractedData = await parseReceiptImage(
      req.file.buffer,
      req.file.mimetype
    );

    return res.status(200).json(new apiResponse(200,extractedData,"Receipt scanned and structured data extracted successfully."));
  } catch (error) {
    throw new apiError(400,error.message);
  }
});

/**
 * 2. Natural Language Sales Analytics (Text-to-Query)
 * @desc    Translates natural language questions into MongoDB aggregation queries
 * @route   POST /api/v1/ai/query
 * @access  Protected (Owner, Admin, Manager)
 */
export const querySalesNaturalLanguage =asyncHandler( async (req, res) => {
  try {
    const { prompt } = req.body;
    const shopId = req.shopId; // Extracted via tenantMiddleware

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        message: "A text prompt is required."
      });
    }

    // Schema structure supplied as context for Gemini
    const invoiceSchemaContext = `
    Collection: invoices
    Fields:
      - shopId: ObjectId
      - invoiceNumber: String
      - customer: { name: String, phone: String, email: String }
      - items: Array of { productId: ObjectId, name: String, sku: String, quantity: Number, unitPrice: Number, taxRate: Number, totalPrice: Number }
      - subTotal: Number
      - taxTotal: Number
      - grandTotal: Number
      - paymentMode: Enum ['Cash', 'Card', 'UPI', 'Credit']
      - paymentStatus: Enum ['Paid', 'Pending', 'Cancelled']
      - createdAt: ISODate
    `;

    // 1. Generate MongoDB Aggregation Pipeline using Gemini
    const rawPipeline = await generateMongoPipeline(prompt, invoiceSchemaContext);

    if (!Array.isArray(rawPipeline)) {
      return res.status(422).json(new apiResponse(422,{},"Failed to generate a valid aggregation pipeline from the prompt."));
    }

    // 2. CRITICAL SECURITY RULE: Enforce tenant isolation at Stage 0
    const tenantFilterStage = {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId)
      }
    };

    // Prepend tenant filter to prevent data cross-contamination
    const securePipeline = [tenantFilterStage, ...rawPipeline];

    // 3. Execute the secured pipeline
    const queryResults = await Invoice.aggregate(securePipeline);

    return res.status(200).json(new apiResponse(200,{
        query: prompt,
        resultsCount: queryResults.length,
        results: queryResults,
        executedPipeline: securePipeline
      },"Natural language query executed successfully."));
    } catch (error) {
        throw new apiError(400,error.message);
    }
});

/**
 * 3. Smart Demand & Low-Stock Forecasting
 * @desc    Analyzes 30-day product sales velocity to predict stock run-out and reorder limits
 * @route   POST /api/v1/ai/forecast
 * @access  Protected (Owner, Admin, Manager)
 */
export const forecastStockDemand = asyncHandler(async (req, res) => {
  try {
    const shopId = req.shopId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch current inventory catalog
    const activeProducts = await Product.find({
      shopId,
      isActive: true
    }).lean();

    if (!activeProducts || activeProducts.length === 0) {
      return res.status(404).json(new apiResponse(404,{},"No active products found in inventory to analyze."));
    }

    // 2. Aggregate sales volume per product over the last 30 days
    const salesAggregates = await Invoice.aggregate([
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "Paid",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalSalesRevenue: { $sum: "$items.totalPrice" }
        }
      }
    ]);

    // Map sales velocity by productId
    const salesMap = new Map();
    salesAggregates.forEach((item) => {
      salesMap.set(item._id.toString(), {
        totalSold: item.totalQuantitySold,
        revenue: item.totalSalesRevenue
      });
    });

    // 3. Merge stock levels with sales run rates
    const salesVelocityPayload = activeProducts.map((prod) => {
      const sales = salesMap.get(prod._id.toString()) || { totalSold: 0, revenue: 0 };
      const dailyRunRate = parseFloat((sales.totalSold / 30).toFixed(2));

      return {
        productId: prod._id.toString(),
        productName: prod.name,
        sku: prod.sku,
        currentStock: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        totalSoldLast30Days: sales.totalSold,
        dailyRunRate
      };
    });

    // 4. Send metrics to Gemini for predictive analysis
    const forecastReport = await analyzeDemandForecast(salesVelocityPayload);

    return res.status(200).json(new apiResponse(200,forecastReport,"Demand forecasting completed successfully."));
  } catch (error) {
    throw new apiError(400,error.message);
  }
});

/**
 * 4. Dynamic Pricing & Bundling Recommender
 * @desc    Detects zero/slow velocity inventory and pairs them with high-velocity items
 * @route   POST /api/v1/ai/recommendations
 * @access  Protected (Owner, Admin, Manager)
 */
export const getSmartPricingRecommendations = asyncHandler(async (req, res) => {
  try {
    const shopId = req.shopId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Get 30-day sales volume breakdown
    const salesAggregates = await Invoice.aggregate([
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "Paid",
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    const activeSoldIds = new Set(salesAggregates.map((item) => item._id.toString()));

    // 2. Query products with stock that had 0 sales in the last 30 days (Dead Stock)
    const allProducts = await Product.find({
      shopId,
      isActive: true,
      stockQuantity: { $gt: 5 } // Has sufficient stock to clear
    }).lean();

    const deadStock = allProducts
      .filter((p) => !activeSoldIds.has(p._id.toString()))
      .slice(0, 10)
      .map((p) => ({
        productId: p._id.toString(),
        productName: p.name,
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stockQuantity
      }));

    // 3. Extract Top 5 Best Sellers
    const topSellers = salesAggregates.slice(0, 5).map((item) => ({
      productId: item._id.toString(),
      productName: item.productName,
      unitsSoldLast30Days: item.totalSold
    }));

    if (deadStock.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No stagnant or slow-moving inventory detected.",
        data: { bundles: [] }
      });
    }

    // 4. Generate dynamic bundling strategies via Gemini
    const bundleRecommendations = await generateBundleDiscounts(deadStock, topSellers);

    return res.status(200).json(new apiResponse(200,bundleRecommendations,"Dynamic bundle discount recommendations generated."));
  } catch (error) {
    throw new apiError(400,error.message);
  }
});