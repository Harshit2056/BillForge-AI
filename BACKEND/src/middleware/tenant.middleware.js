import {User} from "../models/user.model.js"
import {Shop} from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"

export const identifyTenant = async(req,res,next)=>{
    try {
        const shopId = req.user.shopId

        if(!shopId){
            throw new apiError(400,"shopId is missing")
        }

        const shop = await Shop.findById(shopId)

        if(!shop){
            throw new apiError(400,"shop not found")
        }

        req.shopId = shop._id;
        next();
    } catch (error) {
        throw new apiError(500,error.message)
    }
};