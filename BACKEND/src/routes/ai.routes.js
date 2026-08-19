import {Router} from "express"
import route from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { identifyTenant } from "../middleware/tenant.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { forecastStockDemand, getSmartPricingRecommendations, querySalesNaturalLanguage, scanReceiptOCR } from "../controllers/ai.controller.js";

const aiRouter = Router();

aiRouter.route("/scan-receipt").post(upload.single("receipt"),scanReceiptOCR)
aiRouter.route("/query").post(verifyJWT,identifyTenant,querySalesNaturalLanguage)
aiRouter.route("/forecast").post(verifyJWT,identifyTenant,forecastStockDemand)
aiRouter.route("/recommendations").post(verifyJWT,identifyTenant,getSmartPricingRecommendations)

export {aiRouter}