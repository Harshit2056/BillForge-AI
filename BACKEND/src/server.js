import "dotenv/config";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";

connectDb();

app.listen(process.env.PORT,()=>{
    console.log(`server is running on:${process.env.PORT}`)
})

