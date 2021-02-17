import "reflect-metadata";
import express from "express"
import databaseStartup from "@utils/database-startup"
import authRouter from "@services/routes/User/authentication-routes"
import userRouter from "@services/routes/User/secure-routes"
import passport from "@services/auth"
import cookieParser from "cookie-parser"
import Student from "@models/Users/Student";
import { hashPassword } from "@utils/passwords";
import { getCustomRepository, getRepository } from "typeorm";
import UserRepo from "@controller/DataAccess/user-repo";
import User from "@models/Users/User";
import Professor from "@models/Users/Admin";

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use('/auth', authRouter)
app.use('/user', userRouter)

const PORT = process.env.SERVER_PORT || 3333
// start listening on $PORT
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup()
})