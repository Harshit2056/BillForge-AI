import mongoose from "mongoose";



const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        unique:true,
        index:true
    },
    address :{
        street:{
            type:String,
            trim:true
        },
        city:{
            type:String,
            trim:true,
            required:true
        },
        state:{
            type:String,
            trim:true,
            required:true
        },
        zipcode:{
            type:String,
            trim:true,
            required:true
        },
    },

    taxId:{
        type:string
    },

    isActive:{
        type:Boolean,
        default:true
    }


},{timestamps:true})

export const Shop = mongoose.model("Shop",shopSchema)