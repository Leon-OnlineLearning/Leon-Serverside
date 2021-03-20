import "reflect-metadata";
import express from "express"
import databaseStartup from "@utils/database-startup"
import authRouter from "@services/Routes/User/AuthenticationRoutes"
import userRouter from "@services/Routes/User/SecureRoutes"
import studentRouter from "@services/Routes/User/Student"
import professorRouter from "@services/Routes/User/Professor"
import passport from "@services/Auth"
import cookieParser from "cookie-parser"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/students',studentRouter)
app.use('/professors', professorRouter)

const PORT = process.env.SERVER_PORT || 3333

// for http in dev
// uncomment this 
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup()
})

app.get("/sayHello",(req,res)=>{
    res.send("hello")
})
