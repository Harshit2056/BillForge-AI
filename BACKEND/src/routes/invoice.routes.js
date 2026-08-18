import {Router} from "express"
import route from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { identifyTenant } from "../middleware/tenant.middleware.js";
import { createInvoice, downloadInvoicePDF, getInvoiceById, getInvoices, getSalesAnalytics } from "../controllers/invoice.controller.js";


const invoiceRouter = Router();

invoiceRouter.route("/").post(verifyJWT,identifyTenant,createInvoice);
invoiceRouter.route("/").get(verifyJWT,identifyTenant,getInvoices);
invoiceRouter.route("/:id").get(verifyJWT,identifyTenant,getInvoiceById);
invoiceRouter.route("/reports/analytics").get(verifyJWT,identifyTenant,getSalesAnalytics);
invoiceRouter.route("/:id/pdf").get(verifyJWT,identifyTenant,downloadInvoicePDF);


export {invoiceRouter}