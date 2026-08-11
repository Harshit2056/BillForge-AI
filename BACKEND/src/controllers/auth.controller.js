import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { blackListedToken } from "../models/blackListedToken.model.js";
import { Shop } from "../models/shop.model.js";

const generateTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken(userId)
        const accessToken = user.generateAccessToken(userId)

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new apiError(500,error.message)
    }
};

const userRegister = asyncHandler(async(req,res)=>{
    const {shopName,address,taxId,ownerName,email,password} = req.body
    const { street, city, state, zipcode } = req.body.address;

    if(!shopName || !ownerName || !email ||!password){
        throw new apiError(400,"shopName,ownerName,email,password is required")
    }

    if(!street || !city || !state || !zipcode){
        throw new apiError(400,"street,city,state,zipcode is required")
    }

    const existingUser = await User.findOne({email:email})
    if(existingUser){
        throw new apiError(400,"user already exists")
    }

    const shop = await Shop.create({
        shopName:shopName,
        address:{
            street:street,
            city:city,
            state:state,
            zipcode:zipcode
        },
        taxId:taxId
    })
    const user = await User.create({
        name:ownerName,
        email:email,
        password:password,
        role:"owner",
        shopId:shop._id
    })

    return res
    .status(201)
    .json(new apiResponse(201,user,"user and shop registration successfully"))
});

const userLogin = asyncHandler(async(req,res)=>{
    const{email,password} = req.body

    if(!email || !password){
        throw new apiError(400,"email,password is required")
    }

    const user = await User.findOne({email:email}).select("+password")

    if(!user){
        throw new apiError(400,"user not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new apiError(400,"password is incorrect")
    }

    const {refreshToken,accessToken} = await user.generateTokens(user._id)

    const user = await User.findById(user._id).select("-password")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new apiResponse(200,user,"user login successfully"))
    
})

const userLogout = asyncHandler(async(req,res)=>{
    await blackListedToken.create({token:req.token})

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{refreshToken:1}
        },
        {new:true}
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new apiResponse(200,{},"user logout successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,req.user,"current user fetched successfully"))
})

export {userRegister,userLogin,userLogout,getCurrentUser}