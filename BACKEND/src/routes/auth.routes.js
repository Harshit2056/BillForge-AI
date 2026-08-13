import Router from "express"
import route from "express"
import { userLogin, userLogout, userRegister } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const authRouter = Router()

authRouter.route("/register").post(userRegister)
authRouter.route("/login").post(userLogin)
authRouter.route("/logout").post(verifyJWT,userLogout)
export {authRouter}