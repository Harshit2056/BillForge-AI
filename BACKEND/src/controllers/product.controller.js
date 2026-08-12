import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import Product from "../models/product.model.js";

const createProduct= asyncHandler(async (req, res) => {
    const{name,price,category,stockQunatity,lowStockThreshold,taxRate,sku,shopId}=req.body;

    if(!name || !price || !category || !stockQunatity || !lowStockThreshold || !taxRate){
        throw new apiError("All fields are required",400);
    }

    const product= await Product.create({
        name:name,
        price:price,
        category:category,
        stockQunatity:stockQunatity,
        lowStockThreshold:lowStockThreshold,
        shopId:req.shopId,
        taxRate:taxRate,  
    })
})
    
