import { asyncHandler } from "../utils/asyncHandler.js";
import { Shop } from "../models/shop.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const getShopProfile = asyncHandler(async(req,res)=>{
    const shop = await Shop.findById(req.shopId)

    if(!shop){
        throw new apiError(400,"shop not found")
    }

    return res
    .status(200)
    .json(new apiResponse(200, shop, "shop profile fetched successfully"))
});

const updateShopProfile = asyncHandler(async(req,res)=>{

    if(req.user.role !== "owner"){
        throw new apiError(403,"only owner can update shop profile")
    }

    const {shopName,address,taxId} = req.body
    const { street, city, state, zipcode } = req.body.address;

    

    const shop = await Shop.findByIdAndUpdate(
        req.shopId,
        {
            $set:{
                ...(shopName !== undefined && { shopName }),
                ...(taxId !== undefined && { taxId }),
                ...(street !== undefined && { "address.street": street }),
                ...(city !== undefined && { "address.city": city }),
                ...(state !== undefined && { "address.state": state }),
                ...(zipcode !== undefined && { "address.zipcode": zipcode })
                    
            }
        },
        {
            new:true
        }
    )

    if(!shop){
        throw new apiError(400,"shop not found")
    }

    return res
    .status(200)
    .json(new apiResponse(200, shop, "shop profile updated successfully"))
    
});

const addStaffMember = asyncHandler(async(req,res)=>{

    if(req.user.role !== "owner"){
        throw new apiError(403,"only owner can add staff member")
    }

    const {name,email,password,role} = req.body

    if(!name || !email || !password || !role){
        throw new apiError(400,"name,email,password,role is required")
    }

    const existingUser = await User.findOne({email:email})
    if(existingUser){
        throw new apiError(400,"user already exists")
    }

    const user = await User.create({
        name:name,
        email:email,
        password:password,
        role:role,
        shopId:req.shopId
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new apiError(400,"no createdUser")
    }

    return res
    .status(201)
    .json(new apiResponse(201,createdUser,"staff member added successfully"))
});

const getAllStaffMembers = asyncHandler(async(req,res)=>{

    if(req.user.role !== "owner"){
        throw new apiError(403,"only owner can get all staff members")
    }

    const staffMembers = await User.find({shopId:req.shopId,role:"staff"}).select("-password -refreshToken")

    return res
    .status(200)
    .json(new apiResponse(200,staffMembers,"all staff members fetched successfully"))
});

const removeStaffMember = asyncHandler(async(req,res)=>{

    if(req.user.role !== "owner"){
        throw new apiError(403,"only owner can remove staff member")
    }

    const {staffId} = req.params
    

    const staffMember = await User.findOneAndUpdate({
        _id:staffId,
        shopId:req.shopId,
        role:"staff",
        isActive: true
    },
    {
        $set:{
            isActive:false
        }
    },
    {
        new:true
    }).select("-password -refreshToken")

    if(!staffMember){
        throw new apiError(404,"staff member not found")
    }

    return res
    .status(200)
    .json(new apiResponse(200,staffMember,"staff member removed successfully"))
});

export {getShopProfile,updateShopProfile,addStaffMember,getAllStaffMembers,removeStaffMember}