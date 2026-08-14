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
        const refreshToken =await user.generateRefreshToken(userId)
        const accessToken =await user.generateAccessToken(userId)

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new apiError(500,error.message)
    }
};

const userRegister = asyncHandler(async(req,res)=>{
    const {shopName,taxId,ownerName,email,password} = req.body
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
    
    const slug= shopName.toLowerCase().replace(/\s+/g, "-")

    const existingShop = await Shop.findOne({ slug });

    if (existingShop) {
        throw new apiError(400, "Shop already exists");
    }

    const shop = await Shop.create({
        shopName:shopName,
        slug:slug,
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

    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res
    .status(201)
    .json(new apiResponse(201,createdUser,"user and shop registration successfully"))
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

    const {refreshToken,accessToken} = await generateTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new apiResponse(200,loggedInUser,"user login successfully"))
    
});

const userLogout = asyncHandler(async(req,res)=>{

    
    if(req.token){
        await blackListedToken.create({token:req.token})
    }

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
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization").replace("Bearer ","")
    
    if(!incomingRefreshToken){
        throw new apiError(400,"token is required ")
    }

    const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET_KEY)

    const user = await User.findById(decodedToken._id);

    if(!decodedToken){
        throw new apiError(401,"imvalid refresh token")
    }

    if(incomingRefreshToken !== user.refreshToken){
        throw new apiError(401,"refresh token is expired or used")
    }

    const options = {
        httpOnly:true,
        secure:true
    }
    
    const {accessToken , refreshToken} = await generateTokens(user._id)
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options) 
    .json(
        new apiResponse(
            200,
            {accessToken,refreshToken},
            "access token refreshed"
        )
    )
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id).select("-refreshToken -password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"current user fetched successfully"))
});

export {userRegister,userLogin,userLogout,getCurrentUser,refreshAccessToken}