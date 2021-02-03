import User, { NonExistingUser } from "@models/User";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { isTokenBlocked } from "@controller/tokens";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth"


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
        {
            usernameField: 'email', passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const user = await User.create({ firstName: req.body.firstName, lastName: req.body.lastName, email: email, password: password })
                return done(null, user)
                return done(null, {})
            } catch (e) {
                return done(e)
            }
        }
    )
)

passport.use(
    'access-token',
    new JWTStrategy({
        jwtFromRequest: (req) => {
            let token = null;
            if (req && req.cookies) token = req.cookies['jwt'];
            return token
        },
        secretOrKey: process.env.JWT_SECRET || 'leon',
    }, (payload, done) => {
        console.log(payload);

        try {
            return done(null, payload)
        } catch (e) {
            return done(e)
        }
    }
    )
)

passport.use(
    'refresh-token',
    new JWTStrategy({
        jwtFromRequest: (req) => {
            return req.body["refreshToken"]
        },
        secretOrKey: process.env.JWT_REFRESH_SECRET || 'leon_refresh',
    }, (payload, done) => {
        try {
            return done(null, payload)
        } catch (e) {
            return done(e)
        }
    }
    )
)

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID || "google_client_id",
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET || "TOP_SECRET",
    callbackURL: "/auth/google/redirect"
},
    async function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        
        try {
            const user = await User.findCreateFind({ 
                where: { id: profile.id },
                defaults: {
                    id: profile.id,
                    firstName: profile.name?.givenName,
                    lastName: profile.name?.familyName,
                    email: profile.emails ? profile.emails[0].value : undefined,
                    thirdPartyCredentials: true
                }
            });
            return done(null, user);
        } catch (e) {
            return done(e);
        }
    }
));

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