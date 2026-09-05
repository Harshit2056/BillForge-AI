import Router from "express"
import route from "express"
import { getCurrentUser, refreshAccessToken, userLogin, userLogout, userRegister, forgotPassword, resetPassword } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const authRouter = Router()

authRouter.route("/register").post(userRegister)
authRouter.route("/login").post(userLogin)
authRouter.route("/logout").post(verifyJWT,userLogout)
authRouter.route("/getUser").get(verifyJWT,getCurrentUser)
authRouter.route("/refresh-token").post(refreshAccessToken)
authRouter.route("/forgot-password").post(forgotPassword)
authRouter.route("/reset-password/:token").post(resetPassword)
export {authRouter}