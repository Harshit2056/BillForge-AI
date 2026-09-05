import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import { createHash } from "crypto";
import { User } from "../models/user.model.js";
import { blackListedToken } from "../models/blackListedToken.model.js";
import { Shop } from "../models/shop.model.js";
import sendEmail from "../services/mail.service.js";

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

const forgotPassword = asyncHandler(async(req,res)=>{

    const { email } = req.body;

    if(!email?.trim()){
        throw new apiError(400,"Email is required")
    }

    const user = await User.findOne({
        $or: [
            { email: email.trim().toLowerCase() },
        ]
    });

    if (!user) {
        throw new apiError(404, "User not found with this email address");
    }

    const resetToken = user.generateResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetURL = `${clientBaseUrl}/reset-password/${resetToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request - BillForge",
            text: `Hi ${user.username},\n\nYou requested a password reset for your BillForge account. Please click the link below to set a new password:\n\n${resetURL}\n\nThis link will expire in 15 minutes. If you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #4f46e5; margin-top: 0;">BillForge &bull; Password Reset</h2>
                    <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hi <strong>${user.username}</strong>,</p>
                    <p style="color: #334155; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your BillForge account. Click the button below to set a new password:</p>
                    <div style="margin: 28px 0; text-align: center;">
                        <a href="${resetURL}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(79,70,229,0.2);">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Or copy and paste this link into your browser:<br/><a href="${resetURL}" style="color: #4f46e5; word-break: break-all;">${resetURL}</a></p>
                    <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;">This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        });
    }
    catch(err){
        console.error("Nodemailer sendMail Error:", err);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        throw new apiError(500, `Email could not be sent: ${err.message}`);
    }

    return res.status(200).json(
        new apiResponse(200, {}, `Password reset email sent to ${user.email}`)
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const token = req.params.token || req.body.token;
    const newPassword = req.body.newPassword || req.body.password;

    if (!token) {
        throw new apiError(400, "Reset token is required");
    }

    if (!newPassword || newPassword.trim().length < 8) {
        throw new apiError(400, "Password is required and must be at least 8 characters");
    }

    const resetPasswordToken = createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new apiError(400, "Invalid or expired password reset link");
    }

    user.password = newPassword.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json(
        new apiResponse(200, {}, "Password reset successfully. You can now login with your new password.")
    );
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

export {userRegister,userLogin,userLogout,getCurrentUser,refreshAccessToken,forgotPassword,resetPassword}