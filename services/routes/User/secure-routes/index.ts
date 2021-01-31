import { Router } from "express"
import passport, { JWTMiddleware } from "@services/auth"

const router = Router()

router.use(JWTMiddleware)
router.use(passport.authenticate('jwt', { session: false }))

router.get('/', (req, res) => {

    res.send({ received: req.user })
})

export default router;
