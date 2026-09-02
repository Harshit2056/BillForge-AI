import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import {Invoice} from "../models/invoice.model.js"
import {Product} from "../models/product.model.js"
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import { Shop } from "../models/shop.model.js";

const createInvoice = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const shopId = req.shopId; // Attached by tenantMiddleware
    const userId = req.user._id; // Attached by authMiddleware
    const { customer, items, paymentMode = "Cash", notes } = req.body;

    // Validate request payload
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item."
      });
    }

    let subTotal = 0;
    let taxTotal = 0;
    const processedItems = [];

    // 2. Process each line item & execute atomic inventory updates
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        throw new apiError(400,"Invalid product or quantity specified.");
      }

      // Fetch product details within the session & tenant boundary
      const product = await Product.findOne({
        _id: productId,
        shopId,
        isActive: true
      }).session(session);

      if (!product) {
        throw new apiError(400,`Product not found or unavailable (ID: ${productId}).`);
      }

      // Check stock availability
      if (product.stockQuantity < quantity) {
        throw new apiError(
          400,`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}`
        );
      }

      // 3. Atomically decrement inventory with stock safeguard check
      const stockUpdateResult = await Product.updateOne(
        {
          _id: product._id,
          shopId,
          stockQuantity: { $gte: quantity } // Concurrency lock condition
        },
        {
          $inc: { stockQuantity: -quantity }
        },
        { session }
      );

      // If concurrency collision occurs (another thread took the last stock)
      if (stockUpdateResult.modifiedCount === 0) {
        throw new apiError(
          400,`Stock conflict detected for "${product.name}". Please retry.`
        );
      }

      // 4. Calculate line item totals & pricing snapshot
      const unitPrice = product.price;
      const itemTaxRate = product.taxRate || 0;
      const lineSubTotal = unitPrice * quantity;
      const lineTax = (lineSubTotal * itemTaxRate) / 100;
      const lineTotal = lineSubTotal + lineTax;

      subTotal += lineSubTotal;
      taxTotal += lineTax;

      // Push immutable snapshot of product at transaction time
      processedItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        taxRate: itemTaxRate,
        taxAmount: lineTax,
        totalPrice: lineTotal
      });
    }

    const grandTotal = Math.round((subTotal + taxTotal) * 100) / 100;

    // 5. Generate human-readable invoice number (e.g., INV-1715000000000-842)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 6. Create Invoice Document within the active session
    const [createdInvoice] = await Invoice.create(
      [
        {
          shopId,
          invoiceNumber,
          createdBy: userId,
          customer: {
            name: customer?.name || "Walk-in Customer",
            phone: customer?.phone || "",
            email: customer?.email || ""
          },
          items: processedItems,
          subTotal: Math.round(subTotal * 100) / 100,
          taxTotal: Math.round(taxTotal * 100) / 100,
          grandTotal,
          paymentMode,
          paymentStatus: "Paid",
          notes: notes || ""
        }
      ],
      { session }
    );

    // 7. Commit Transaction (Permanently applies stock deductions & invoice creation)
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(new apiResponse(200,{createdInvoice},"Invoice generated successfully."));
  } catch (error) {
    // 8. Rollback Transaction on ANY error (0% Stock Inconsistency Guarantee)
    await session.abortTransaction();
    session.endSession();

    return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong"
  });
    
  }
});

const getInvoices = asyncHandler(async (req, res) => {

    const { page = 1, limit = 20 } = req.query;

    const options = {
        page: Number(page),
        limit: Number(limit),
        sort: {
            createdAt: -1
        }
    };

    const invoices = await Invoice.paginate(
        {
            shopId: req.shopId
        },
        options
    );

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                invoices,
                "Invoices fetched successfully"
            )
        );
});

const getInvoiceById = asyncHandler(async(req,res)=>{
    const {id}=req.params

    const invoice = await Invoice.findOne({
        _id:id,
        shopId: req.shopId
    })

    if(!invoice){
       throw new apiError(400,"no invoice") 
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                invoice,
                "Invoices fetched successfully"
            )
        );
});

const downloadInvoicePDF = asyncHandler(async(req,res)=>{
    try {
    const { id } = req.params;
    const shopId = req.shopId; // Extracted safely from tenantMiddleware

    // 1. Fetch Invoice and Shop Details in parallel
    const [invoice, shop] = await Promise.all([
      Invoice.findOne({ _id: id, shopId }),
      Shop.findById(shopId)
    ]);

    if (!invoice) {
      return res.status(404).json(new apiResponse(404,{},"Invoice not found."));
    }

    if (!shop) {
      return res.status(404).json(new apiResponse(404,{},"Shop details not found."));
    }

    // 2. Configure HTTP Headers for streaming PDF download
    const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // 3. Initialize PDFKit Document
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Pipe PDF stream directly into the HTTP response
    doc.pipe(res);

    // ==========================================
    // SECTION 1: HEADER & SHOP INFO (TEXT-BASED)
    // ==========================================
    // Left side: Shop Name & Contact Details
    doc
      .fillColor("#1e293b")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(shop.shopName.toUpperCase(), 40, 45);

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font("Helvetica")
      .text(shop.address?.street || "", 40, 70)
      .text(
        `${shop.address?.city || ""}, ${shop.address?.state || ""} - ${shop.address?.zipCode || ""}`
      )
      .text(`GSTIN / Tax ID: ${shop.taxId || "N/A"}`)
      .text(`Phone: ${shop.phone || "N/A"}`);

    // Right side: Invoice Title & Meta Details
    doc
      .fillColor("#0f172a")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("INVOICE", 380, 45, { align: "right" });

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font("Helvetica")
      .text(`Invoice No: ${invoice.invoiceNumber}`, 380, 72, { align: "right" })
      .text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}`,
        380,
        86,
        { align: "right" }
      )
      .text(`Payment Mode: ${invoice.paymentMode}`, 380, 100, { align: "right" })
      .text(`Status: ${invoice.paymentStatus}`, 380, 114, { align: "right" });

    // Horizontal Divider Line
    doc
      .moveTo(40, 140)
      .lineTo(555, 140)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();

    // ==========================================
    // SECTION 2: CUSTOMER / BILLED TO DETAILS
    // ==========================================
    doc
      .fillColor("#0f172a")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("BILLED TO:", 40, 155);

    doc
      .fillColor("#334155")
      .fontSize(9)
      .font("Helvetica")
      .text(`Customer Name: ${invoice.customer?.name || "Walk-in Customer"}`, 40, 170)
      .text(`Phone: ${invoice.customer?.phone || "N/A"}`, 40, 184)
      .text(`Email: ${invoice.customer?.email || "N/A"}`, 40, 198);

    // ==========================================
    // SECTION 3: ITEMS TABLE HEADER
    // ==========================================
    const tableTop = 225;

    // Header Background Bar
    doc
      .rect(40, tableTop - 5, 515, 22)
      .fillColor("#f1f5f9")
      .fill();

    // Table Header Labels
    doc
      .fillColor("#334155")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Item / Description", 50, tableTop)
      .text("SKU", 210, tableTop)
      .text("Qty", 280, tableTop, { width: 40, align: "right" })
      .text("Unit Price", 330, tableTop, { width: 60, align: "right" })
      .text("Tax (%)", 400, tableTop, { width: 50, align: "right" })
      .text("Total", 460, tableTop, { width: 85, align: "right" });

    // Header underline
    doc
      .moveTo(40, tableTop + 18)
      .lineTo(555, tableTop + 18)
      .strokeColor("#cbd5e1")
      .stroke();

    // ==========================================
    // SECTION 4: TABLE ROWS (LINE ITEMS)
    // ==========================================
    let currentY = tableTop + 26;

    doc.font("Helvetica").fontSize(9);

    invoice.items.forEach((item) => {
      // Row text
      doc
        .fillColor("#1e293b")
        .text(item.name, 50, currentY, { width: 155, ellipsis: true })
        .fillColor("#64748b")
        .text(item.sku || "-", 210, currentY)
        .fillColor("#1e293b")
        .text(item.quantity.toString(), 280, currentY, { width: 40, align: "right" })
        .text(item.unitPrice.toFixed(2), 330, currentY, { width: 60, align: "right" })
        .text(`${item.taxRate || 0}%`, 400, currentY, { width: 50, align: "right" })
        .text(item.totalPrice.toFixed(2), 460, currentY, { width: 85, align: "right" });

      // Light row divider
      currentY += 20;
      doc
        .moveTo(40, currentY - 4)
        .lineTo(555, currentY - 4)
        .strokeColor("#f1f5f9")
        .stroke();
    });

    // ==========================================
    // SECTION 5: TOTALS / SUMMARY
    // ==========================================
    const summaryTop = currentY + 15;

    // Subtotal
    doc
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(9)
      .text("Sub Total:", 360, summaryTop, { width: 90, align: "right" })
      .fillColor("#0f172a")
      .text(invoice.subTotal.toFixed(2), 460, summaryTop, { width: 85, align: "right" });

    // Tax Total
    doc
      .fillColor("#475569")
      .text("Tax Total:", 360, summaryTop + 16, { width: 90, align: "right" })
      .fillColor("#0f172a")
      .text(invoice.taxTotal.toFixed(2), 460, summaryTop + 16, { width: 85, align: "right" });

    // Grand Total Bar
    doc
      .rect(340, summaryTop + 34, 215, 26)
      .fillColor("#f8fafc")
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .fillAndStroke();

    doc
      .fillColor("#0f172a")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Grand Total:", 350, summaryTop + 41, { width: 100, align: "left" })
      .text(
        `${shop.currency || "INR"} ${invoice.grandTotal.toFixed(2)}`,
        450,
        summaryTop + 41,
        { width: 95, align: "right" }
      );

    // ==========================================
    // SECTION 6: FOOTER / TERMS
    // ==========================================
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text("Thank you for your business!", 40, 750, { align: "center", width: 515 })
      .text(
        "This is a computer-generated tax invoice. No signature required.",
        40,
        762,
        { align: "center", width: 515 }
      );

    // 4. Finalize PDF
    doc.end();
  } catch (error) {
    throw new apiError(500,error.message || "Failed to fetch invoices")
  }
});

const getSalesAnalytics = asyncHandler(async(req,res)=>{
    try {
    const shopId = req.shopId; // Extracted via tenantMiddleware
    const { period = "30days", startDate, endDate } = req.query;

    // 1. Determine Date Range Filter
    let start = new Date();
    let end = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      // Include the entire end day up to 23:59:59.999
      end.setHours(23, 59, 59, 999);
    } else {
      // Default presets
      switch (period) {
        case "today":
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case "7days":
          start.setDate(start.getDate() - 7);
          break;
        case "30days":
          start.setDate(start.getDate() - 30);
          break;
        case "1year":
          start.setFullYear(start.getFullYear() - 1);
          break;
        default:
          start.setDate(start.getDate() - 30);
      }
    }

    // 2. Execute High-Performance Aggregation Pipeline
    const [analyticsResult] = await Invoice.aggregate([
      // Stage 1: Fast match on indexed compound index { shopId: 1, createdAt: -1 }
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "Paid",
          createdAt: { $gte: start, $lte: end }
        }
      },

      // Stage 2: Multi-facet Parallel Aggregations
      {
        $facet: {
          // A. Overall Financial Totals
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$grandTotal" },
                netSales: { $sum: "$subTotal" },
                totalTaxCollected: { $sum: "$taxTotal" },
                totalInvoices: { $sum: 1 },
                avgOrderValue: { $avg: "$grandTotal" }
              }
            }
          ],

          // B. Daily Sales Velocity / Trend (for Charts)
          salesTrend: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                revenue: { $sum: "$grandTotal" },
                ordersCount: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } } // Sort chronologically ascending
          ],

          // C. Payment Mode Distribution (Cash vs UPI vs Card vs Credit)
          paymentMethodBreakdown: [
            {
              $group: {
                _id: "$paymentMode",
                totalAmount: { $sum: "$grandTotal" },
                count: { $sum: 1 }
              }
            },
            { $sort: { totalAmount: -1 } }
          ],

          // D. Top 5 Best-Selling Products by Volume
          topSellingProducts: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productId",
                productName: { $first: "$items.name" },
                sku: { $first: "$items.sku" },
                quantitySold: { $sum: "$items.quantity" },
                revenueGenerated: { $sum: "$items.totalPrice" }
              }
            },
            { $sort: { quantitySold: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    // 3. Format Response Payload with Safe Defaults
    const summaryData = analyticsResult.summary[0] || {
      totalRevenue: 0,
      netSales: 0,
      totalTaxCollected: 0,
      totalInvoices: 0,
      avgOrderValue: 0
    };

    res.status(200).json(new apiResponse(200,{
        timeRange: {
          start,
          end,
          period
        },
        summary: {
          totalRevenue: Math.round(summaryData.totalRevenue * 100) / 100,
          netSales: Math.round(summaryData.netSales * 100) / 100,
          totalTaxCollected: Math.round(summaryData.totalTaxCollected * 100) / 100,
          totalInvoices: summaryData.totalInvoices,
          avgOrderValue: Math.round(summaryData.avgOrderValue * 100) / 100
        },
        salesTrend: analyticsResult.salesTrend.map((trend) => ({
          date: trend._id,
          revenue: Math.round(trend.revenue * 100) / 100,
          ordersCount: trend.ordersCount
        })),
        paymentMethodBreakdown: analyticsResult.paymentMethodBreakdown,
        topSellingProducts: analyticsResult.topSellingProducts
    },"Sales analytics fetched successfully."));
  } catch (error) {
    throw new apiError(500,error.message || "Failed to fetch invoices");
  }
});

export {createInvoice,getInvoiceById,getInvoices,downloadInvoicePDF,getSalesAnalytics}