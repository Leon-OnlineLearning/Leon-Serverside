import express from "express"
import sequelize, { connectionInfo } from "./utils/database-connection"

const app = express()

const PORT = process.env.SERVER_PORT || 3333
// start listening on 3333
app.listen(PORT, async () => {
    console.log(`username ${connectionInfo.username} password ${connectionInfo.password}`)
    console.log(`listening on port ${PORT}`);
    try {
        await sequelize.authenticate()
        console.log('database connected successfully');
    } catch (error) {
        console.error('Couldn\'t connect to database', error);
    }
})