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

router.post('/login', passport.authenticate('login'), (req, res) => {
    const user: any = req.user;
    const token = jwt.sign({ email: user["email"], id: user["id"], firstName: user["firstName"], lastName: user["lastName"] }, process.env.JWT_SECRET || 'leon')
    return (res.json({ token }))
})
export default router;