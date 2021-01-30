import express from "express"
import databaseStartup from "@utils/database-startup"
import User from "@models/User"
import usersRouter from "@services/routes/User"
import passport from "@services/auth"

const app = express()
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use('/users', usersRouter)

const PORT = process.env.SERVER_PORT || 3333
// start listening on $PORT
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup()
    console.log('connected to database')
})