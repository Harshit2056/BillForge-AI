import { blackListedToken } from "../models/blackListedToken.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const authHeader = req.header("Authorization") || req.header("authorization");

    const token =
        (authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null) ||
        req.cookies?.accessToken ||
        req.cookies?.refreshToken;

    if(!token){
        throw new apiError(401, "Authentication token is required");
    }

    const isTokenblacklisted = await blackListedToken.findOne({ token });

    if(isTokenblacklisted){
        throw new apiError(401, "Token is invalid or blacklisted");
    }    
    
    req.token = token;

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    } catch (err) {
        try {
            decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
        } catch (refreshErr) {
            throw new apiError(401, "Token is invalid or expired");
        }
    }

    const user = await User.findById(decodedToken?._id).select("-password");

    if(!user){
        throw new apiError(401, "User not found");
    }

    req.user = user;
    next();
});