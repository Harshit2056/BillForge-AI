import { Router } from "express";
import route from "express"
import { adjustStockQuantity, createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { identifyTenant } from "../middleware/tenant.middleware.js";

const productRouter = Router();

productRouter.route("/").post(verifyJWT,identifyTenant,createProduct)
productRouter.route("/").get(verifyJWT,identifyTenant,getProducts)
productRouter.route("/:id").get(verifyJWT,identifyTenant,getProductById)
productRouter.route("/:id").put(verifyJWT,identifyTenant,updateProduct)
productRouter.route("/:id/stock").patch(verifyJWT,identifyTenant,adjustStockQuantity)
productRouter.route("/:id").delete(verifyJWT,identifyTenant,deleteProduct)


export {productRouter}