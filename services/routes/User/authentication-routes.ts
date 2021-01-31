import express from "express"
import passport from "@services/auth"
import jwt from "jsonwebtoken"

const router = express.Router();

router.post('/signup', (req, res) => {
    passport.authenticate('signup', (error, user) => {
        if (error) {
            res.status(422)
            res.send(error.errors[0].message)
        }
        if (user) {
            res.json({ email: user["email"], firstName: user["firstName"], lastName: user["lastName"] })
        }
    })(req, res)
})

router.post('/login', passport.authenticate('login', { session: false }), (req, res) => {
    const user: any = req.user;
    const payload = { id: user["id"], firstName: user["firstName"], lastName: user["lastName"] }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'leon', { expiresIn: "15m" })
    res.cookie('jwt', token, { httpOnly: true })
    res.json({ success: true, token })
})

export default router;