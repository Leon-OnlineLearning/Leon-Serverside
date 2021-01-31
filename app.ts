import express from "express"
import databaseStartup from "@utils/database-startup"

const app = express()

const PORT = process.env.SERVER_PORT || 3333
// start listening on $PORT
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup()
    console.log('connected to database')
})