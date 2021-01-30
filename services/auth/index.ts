import User, { NonExistingUser } from "@models/User";
import passport from "passport";
import passportLocal from "passport-local";
import jwt from "jsonwebtoken";

const LocalStrategy = passportLocal.Strategy;

passport.use('login',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const correctUser = await User.verifyPassword(email, password)
            if (!correctUser) {
                return done(null, false, { message: 'Incorrect password!' })
            }
            done(null, correctUser)
        } catch (e) {
            if (e instanceof NonExistingUser) {
                return done(null, false, { message: e.message })
            }
            else {
                return done(e)
            }
        }
    })
)

passport.use(
    'signup',
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
        async (req, email, password, done) => {
            try {
                const user = await User.create({ firstName: req.body.firstName, lastName: req.body.lastName, email: email, password: password })
                return done(null, user)
            } catch (e) {
                return done(e)
            }
        }
    )
)

passport.serializeUser((user: any, done) => {
    const token = jwt.sign({ email: user["email"], id: user["id"], firstName: user["firstName"], lastName: user["lastName"] }, process.env.JWT_SECRET || 'leon')

    done(null, { token })
})

passport.deserializeUser((user, done) => {
    console.log(user);
    done(null)
})

export default passport;