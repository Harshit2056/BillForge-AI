import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"

const app= express();

app.use(cookieParser())
app.use(helmet())
app.use(cors({
    origin:"",
    Credential:true}
))

app.use(express.urlencoded())
app.use(express.static("public",{extends:true}))
app.use(express.json({limit:"16kb"}))


import { authRouter } from "./routes/auth.routes.js";
app.use("/api/v1/auth",authRouter)

export {app}



