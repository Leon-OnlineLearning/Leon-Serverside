import User, { NonExistingUser, UserRole } from "@models/User";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy } from "passport-jwt";
import { isTokenBlocked } from "@controller/tokens";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth"
import verifyPassword from "@controller/BusinessLogic/User/validate-user";
import { getConnection, getCustomRepository, getRepository } from "typeorm";
import UserRepo from "@controller/DataAccess/user-repo";
import { hashPassword } from "@utils/passwords";


passport.use('login',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const correctUser = await verifyPassword(email, password)

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
                const repo = getCustomRepository(UserRepo)
                const user = new User();
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.password = await hashPassword(password);
                user.email = email;
                user.role = req.body.role;
                await repo.save(user)
                return done(null, user)
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
    async function (_accessToken, _refreshToken, profile, done) {

        try {
            // throw new Error("To be implemented");

            const repo = getCustomRepository(UserRepo)
            const user = new User();
            user.firstName = profile.name?.givenName || "No firstName";
            user.lastName = profile.name?.familyName || "No lastName";
            user.thirdPartyAccount = true;
            if (profile.emails) {
                user.email = profile.emails[0].value
            } else {
                throw new Error("Email is not provided");
            }
            await repo.save(user);
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
