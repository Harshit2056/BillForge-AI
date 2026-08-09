import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const connectDb = async()=>{
    try {
        const connectingDb = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("Database is connected!!!!")
    } catch (error) {
        console.log(error.message)
    }
}

export {connectDb}