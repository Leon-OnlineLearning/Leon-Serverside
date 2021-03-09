import "reflect-metadata";
import express from "express"
import databaseStartup from "@utils/database-startup"
import authRouter from "@services/Routes/User/AuthenticationRoutes"
import userRouter from "@services/Routes/User/SecureRoutes"
import studentRouter from "@services/Routes/User/Student"
import passport from "@services/Auth"
import cookieParser from "cookie-parser"
import https from "https";
import fs from "fs"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/students',studentRouter)

const PORT = process.env.SERVER_PORT || 3333

// NOTE: DO NOT DELETE THIS COMMENT!
// for http in dev
// uncomment this 
// app.listen(PORT, async () => {
//     console.log(`listening on port ${PORT}`);
//     await databaseStartup()
// })

app.get("/sayHello",(req,res)=>{
    res.send("hello")
})

// for https in dev
https.createServer({
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
    passphrase: 'a'
}, app)
    .listen(PORT, async () => {
        console.log(`listening on port ${PORT}`);
        
        await databaseStartup()
    });
