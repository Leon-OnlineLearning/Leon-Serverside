import express from "express"
import passport from "@services/auth"
import { blockId, generateAccessToken, generateRefreshToken, isTokenValidAndExpired, getPayloadFromJWT, getUserFromJWT } from "@controller/tokens";
import User from "@models/User";

const router = express.Router();

router.post('/signup', async (req, res) => {
    if (!req.body["email"] || !req.body["password"]) {
        res.send('Bad request').status(400)
    }
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
    await login(user, res)
    // const token = await generateAccessToken(user)
    // const refreshToken = await generateRefreshToken(user)
    // res.cookie('jwt', token, { httpOnly: true })
    // res.json({ success: true, token, refreshToken })
})

async function login(user: any, res: any) {
    const token = await generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user)
    res.cookie('jwt', token, { httpOnly: true })
    res.json({ success: true, token, refreshToken })
}

router.post('/refreshToken', passport.authenticate('refresh-token', { session: false }), async (req, res) => {

    // check if the old token is valid and expired
    console.log('cookie!', req.cookies['jwt']);

    let validAndExpired = await isTokenValidAndExpired(req.cookies['jwt'])
    // if so send new token with payload generated from user call from the id
    // otherwise send 400 bad request
    console.log(validAndExpired);

    if (validAndExpired) {
        const user = await getUserFromJWT(req.cookies['jwt'])
        const token = await generateAccessToken(user, true)
        res.cookie('jwt', token, { httpOnly: true })
        res.send({ success: true, token, message: "new token generated" })
    } else {
        res.status(400).send('Invalid old token state')
    }
})

router.post('/logout', async (req, res) => {
    const token = req.cookies['jwt']
    const user: any = await getPayloadFromJWT(token)
    await blockId(user["id"])
    res.clearCookie('jwt')
    res.status(205).send('logged out!')
})

router.get('/google', passport.authenticate('google', {
    scope: ["profile", "email"],
    session: false
}));

router.get('/google/redirect', passport.authenticate('google', { session: false }), async (req: any, res) => {
    const user = req.user[0]['dataValues']
    await login(user, res)
    // res.send('TODO: send jwt info here')
})

export default router;