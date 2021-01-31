import { Router } from "express"
import passport from "@services/auth"

const router = Router()

router.use(passport.authenticate('jwt', { session: false }))

router.get('/',(req,res) => {
    res.send({received: req.user})
})

export default router;
