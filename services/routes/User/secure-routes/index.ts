/**
 * Secure routes = routes that require access token to be accessed
 */
import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/auth"
import { blockToken } from "@controller/expired-tokens"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('jwt', { session: false }))

router.get('/', (req, res) => {
    res.send({ received: req.user })
})

router.post('/logout', async (req,res)=>{
    const token = req.cookies['jwt']
    const user:any = req.user
    await blockToken(token, user['exp'])
    res.clearCookie('jwt')
    res.status(205).send('logged out!')
})
export default router;
