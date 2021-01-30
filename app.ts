import express from "express"
import dotenv from "dotenv"
import sequelize from "./utils/database-connection"
// init env vars
dotenv.config()

const app = express()

// start listening on 3333
app.listen(process.env.PORT || 3333,()=>{ console.log("listen on 3333...") })