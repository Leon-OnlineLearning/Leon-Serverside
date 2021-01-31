import User, { NonExistingUser } from "@models/User";
import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import { isTokenBlocked } from "@controller/expired-tokens";

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;

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

passport.use(
    new JWTStrategy({
        jwtFromRequest: (req) => {
            let token = null;
            if (req && req.cookies) token = req.cookies['jwt'];
            return token
        },
        secretOrKey: process.env.JWT_SECRET || 'leon',
    }, (payload, done) => {
        try {
            return done(null, payload)
        } catch (e) {
            return done(e)
        }
    }
    )
)

export const BlockedJWTMiddleware = async (req: any, res: any, next: any) => {
    // get the token from request cookies
    let token; 
    if (req && req.cookies) token = req.cookies['jwt'];
    if (!token) res.status(401).send("Token not found")
    // if blocked:token exist in cache 
    if (await isTokenBlocked(token)) 
        res.status(401).send("Token Blocked!")
    // return 401 unauthorized
    next()
}

export default passport;