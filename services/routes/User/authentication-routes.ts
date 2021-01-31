import express from "express"
import passport from "@services/auth"
import { blockToken, generateAccessToken, generateRefreshToken, isTokenValidAndExpired, getPayloadFromJWT, getUserFromJWT } from "@controller/tokens";
import User from "@models/User";

const router = express.Router();

router.post('/signup', async (req, res) => {
    passport.authenticate('signup', async (error, user) => {
        if (error) {
            res.status(422)
            res.send(error.errors[0].message)
        }
        if (user) {
            const token = await generateAccessToken(user)
            const refreshToken = await generateRefreshToken(user)
            res.cookie('jwt', token, { httpOnly: true })
            res.json({ success: true, token, refreshToken, email: user["email"], firstName: user["firstName"], lastName: user["lastName"] })
        }
    })(req, res)
})

router.post('/login', passport.authenticate('login', { session: false }), async (req, res) => {
    const user: any = req.user;
    const token = await generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user)
    res.cookie('jwt', token, { httpOnly: true })
    res.json({ success: true, token, refreshToken })
})

router.post('/refreshToken', passport.authenticate('refresh-token', { session: false }), async (req, res) => {
    
    // check if the old token is valid and expired
    let validAndExpired = await isTokenValidAndExpired(req.body.oldToken)
    // if so send new token with payload generated from user call from the id
    // otherwise send 400 bad request
    if (validAndExpired) {
        const user = await getUserFromJWT(req.body.oldToken)
        const token = await generateAccessToken(user)
        res.cookie('jwt', token, { httpOnly: true })
        res.send({success: true, token, message: "new token generated"})
    } else {
        res.status(400).send('Invalid old token state')
    }
})

router.post('/logout', async (req,res)=>{
    const token = req.cookies['jwt']
    const user:any = await getPayloadFromJWT(token)
    await blockToken(token, user['exp'])
    res.clearCookie('jwt')
    res.status(205).send('logged out!')
})
export default router;