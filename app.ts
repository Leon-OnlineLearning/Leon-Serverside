import express from "express"
import databaseStartup from "@utils/database-startup"
import User from "@models/User"

const app = express()

const PORT = process.env.SERVER_PORT || 3333
// start listening on $PORT
app.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    await databaseStartup()
    console.log('connected to database')
    console.warn('warning: dummy test code delete this after your finish')
    let u1 = await User.build({email:"email", password: "password", firstName: "susu",lastName:"koko"})
    console.log(`u1 was created and it's password is ${u1}`);
    await u1.save();
    console.log('testing password')
    const correctPassword = await User.correctPassword('email','password')
    console.log(correctPassword)
    const correctPassword2 = await User.correctPassword('email','pssword')
    console.log(correctPassword2)
})