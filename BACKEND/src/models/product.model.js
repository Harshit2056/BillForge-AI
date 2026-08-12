import mongoose from "mongoose";



const productSchema = new mongoose.Schema({
    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        required:true,
        index:true
    },
    sku:{
        type:String,
        required:true,
        index:true
    },
    name:{
        type:String,
        required:true,
        index:true
    },
    category:{
        type:String,
        index:true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },

    stockQuantity: {
        type: Number,
        default: 0,
        min: 0
    },

    lowStockThreshold: {
        type: Number,
        default: 5,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
    
},{timestamps:true})

export const Product = mongoose.model("Product",productSchema)