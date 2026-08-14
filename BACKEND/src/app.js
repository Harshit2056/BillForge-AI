import express from "express"

import cookieParser from "cookie-parser"
import helmet from "helmet"

const app= express();

app.use(cookieParser())
app.use(helmet())


app.use(express.urlencoded({extended:true}))
app.use(express.static("public",{extends:true}))
app.use(express.json())


import { authRouter } from "./routes/auth.routes.js";
import { shopRouter } from "./routes/shop.routes.js";
import { productRouter } from "./routes/product.routes.js";


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/shops",shopRouter)
app.use("/api/v1/products",productRouter)

export {app}



