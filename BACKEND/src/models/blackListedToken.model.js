import mongoose from "mongoose"

const blackListedTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is require to be added in blacklist"]
    }
},{timestamps:true})

export const blackListedToken = mongoose.model("blackListedToken",blackListedTokenSchema)