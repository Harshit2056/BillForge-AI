import mongoose, { mongo } from"mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({

    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        required:true,
        index:true
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },

    role: {
        type: String,
        enum: ["owner", "staff"],
    },
    isActive:{
        type:Boolean,
        default:true
    },
    refreshToken:{
        type:String,
        default:null
    }
},{timestamps:true})

userSchema.pre("save",async function() {
    if(!this.isModified("password")){
        return;
    }

    this.password = await bcrypt.hash(this.password,10);
   
})

userSchema.methods.isPasswordCorrect =async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {_id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY_DATE
        }
    )
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {_id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY_DATE
        }
    )
}


export const User = mongoose.model("User",userSchema)