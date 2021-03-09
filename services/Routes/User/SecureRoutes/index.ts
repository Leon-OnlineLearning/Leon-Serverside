/**
 * Secure routes = routes that require access token to be accessed
 */
import { Router } from "express"
import passport, { BlockedJWTMiddleware } from "@services/Auth"

const router = Router()

router.use(BlockedJWTMiddleware)
router.use(passport.authenticate('access-token', { session: false }))

router.get('/', (req, res) => {
    res.send({ received: req.user })
})

export default router;
