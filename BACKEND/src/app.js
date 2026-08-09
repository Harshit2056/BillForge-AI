import express from "express"
import cors from "cors"

const app= express();

app.use(cors({
    origin:"",
    Credential:true}
))

app.use(express.urlencoded())
app.use(express.static("public",{extends:true}))
app.use(express.json({limit:"16kb"}))

export {app}
