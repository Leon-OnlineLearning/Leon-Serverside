import { Router } from "express"
import passport, { JWTMiddleware } from "@services/auth"
import { blockToken } from "@controller/expired-tokens"

const router = Router()

router.use(JWTMiddleware)
router.use(passport.authenticate('jwt', { session: false }))

router.get('/', (req, res) => {
    res.send({ received: req.user })
})

router.post('/signout', async (req,res)=>{
    const token = req.cookies['jwt']
    const user:any = req.user
    await blockToken(token, user['exp'])
    res.status(205).send('logged out!')
})
export default router;
