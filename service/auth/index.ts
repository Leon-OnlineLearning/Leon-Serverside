import User, { NonExistingUser } from "@models/User";
import passport from "passport"
import passportLocal from "passport-local"

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
                const user = await User.create({firstName: req.body.firstName, lastName: req.body.lastName, email:email, password: password})
            } catch (e) {
                return done(e)
            }
        }
    )
)

export default passport;