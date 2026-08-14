import { Router } from "express";
import route from "express"
import { addStaffMember, getAllStaffMembers, getShopProfile, removeStaffMember, updateShopProfile } from "../controllers/shop.controller.js";
import { identifyTenant } from "../middleware/tenant.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const shopRouter = Router()

shopRouter.route("/profile").get(verifyJWT ,identifyTenant,getShopProfile)
shopRouter.route("/profile").put(verifyJWT,identifyTenant,updateShopProfile)
shopRouter.route("/staff").post(verifyJWT,identifyTenant,addStaffMember)
shopRouter.route("/staff").get(verifyJWT,identifyTenant,getAllStaffMembers)
shopRouter.route("/staff/:staffId").delete(verifyJWT,identifyTenant,removeStaffMember)

export {shopRouter}