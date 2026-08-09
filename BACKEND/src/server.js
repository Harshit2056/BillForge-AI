import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";


dotenv.config({
    path:"./.env"
})

connectDb();

app.listen(process.env.PORT,()=>{
    console.log(`server is running on:${process.env.PORT}`)
})

