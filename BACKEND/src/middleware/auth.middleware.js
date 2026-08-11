import { blackListedToken } from "../models/blackListedToken.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookie.refreshToken || req.header("Authorization").replace("Bearer ","")
    
        if(!token){
            throw new apiError(400,"token is required ")
        }

        const isTokenblacklisted = await blackListedToken.findOne({token:token})

        if(isTokenblacklisted){
            return res.status(401).json(new apiResponse(401,{},"token is not valid"))
        }    
        
        req.token  = token;
    
        const deocdedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET_KEY)
    
        const user = await User.findById(deocdedToken._id).select("-password")
    
        if(!user){
            throw new apiError(400,"user not found")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new apiError(401,error.message)
    }
    
})