import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import {Product} from "../models/product.model.js";
import {apiResponse} from "../utils/apiResponse.js";

const createProduct= asyncHandler(async (req, res) => {
    const{name,price,category,stockQunatity,lowStockThreshold,taxRate,sku,shopId}=req.body;

    if(!name || price===undefined || !sku || stockQunatity===undefined){
        throw new apiError(400,"required fields are missing");
    }

    const existingProduct= await Product.findOne({sku:sku,shopId:req.shopId});

    if(existingProduct){
        throw new apiError(400,"product with this sku already exists");
    }

    const product= await Product.create({
        name:name,
        price:price,
        category:category,
        stockQunatity:stockQunatity,
        lowStockThreshold:lowStockThreshold,
        shopId:req.shopId,
        taxRate:taxRate,  
        sku:sku
    })

    return res.status(201).json(
        new apiResponse(true,product,"product created successfully")
    )

});

const getProducts= asyncHandler(async (req, res) => {
    const {search,category,limit =10,page=1,lowStock} = req.query;

    const query = {
        shopId: req.shopId,
        isActive: true
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } }
        ];
    }


    if (category) {
        query.category = category;
    }

    if (lowStock === "true") {
        query.$expr = {
            $lte: ["$stockQuantity", "$lowStockThreshold"]
        };
    }

    const options = {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 }
    };

    const result = await Product.paginate(query, options);

    return res.status(200).json(
        new ApiResponse(
            200,
            {result},
            "Products fetched successfully"
        )
    );

});

const getProductById = asyncHandler(async(req,res)=>{
    const {id}= req.params;

    const product = await Product.findOne({
        shopId:req.shopId,
        _id:id,
        isActive:true
    })  

    if(!product){
        throw new apiError(400,"product is missing")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {product},
            "Products fetched successfully"
        )
    );
    
});

const updateProduct = asyncHandler(async(req,res)=>{

    if(req.user.role !== "owner"){
        throw new apiError(400,"only owner can update the products")
    }

    const{name,price,category,lowStockThreshold,taxRate,sku,shopId}=req.body;

    const product = await Product.findByIdAndUpdate
});

export {createProduct,getProducts,getProductById,updateProduct}






