import express from "express"
import dotenv from "dotenv"
import sequelize, {connectionInfo} from "./utils/database-connection"

const app = express()

const PORT =  process.env.PORT || 3333
// start listening on 3333
app.listen( PORT , async () => {
    console.log(`username ${connectionInfo.username} password ${connectionInfo.password}`)
    console.log(`listening on port ${PORT} @ ${connectionInfo.host}`);
    await sequelize.authenticate()
    console.log('database connected successfully');
})