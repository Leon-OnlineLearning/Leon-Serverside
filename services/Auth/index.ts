/**
 *  About user default year 
 *      if new student has signed up with google 
 *      it will be in the first year by default
 *      because we don't have enough info comming from google
 */

import User, { NonExistingUser } from "@models/Users/User";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy } from "passport-jwt";
import { isTokenBlocked } from "@controller/Tokens";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth"
import getCorrectUser from "@controller/BusinessLogic/User/validate-user";
import { getRepository } from "typeorm";
import UserRepo from "@controller/DataAccess/user-repo";
import { hashPassword } from "@utils/passwords";
import Student from "@models/Users/Student";
import UserTypes from "@models/Users/UserTypes";
import UserClassFactory from "@models/Users/UserClassMapper";
import { NextFunction, Request, Response } from "express";
import { UserThirdPartySchema, UserValidationSchema } from "@models/Users/validators/schema/UserSchema";
import UserInputError from "@services/utils/UserInputError";

passport.use('login',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const correctUser = await getCorrectUser(email, password)

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

                let role = UserTypes.STUDENT;

                if (req.body.role && typeof req.body.role === "string") {
                    role = req.body.role;
                }


                // const [repo, user] = [getRepository(UserClassMapper[role]),UserClassMapper[role]]
                const UserClass = UserClassFactory(role)
                const user = new UserClass()
                const repo = getRepository(UserClass)

                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.password = await hashPassword(password);
                user.email = email;

                await UserValidationSchema.validateAsync({ ...user, password })

                await repo.save(user)
                return done(null, { ...user, role })
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
            if (req && (req.cookies || req.body['jwt'])) token = req.cookies['jwt'] || req.body['jwt'];
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

/**
 *  convert information provided by google to information that we can use in our app
 */
export async function googleInfoToUserInfoMapper(profile: any) {
    let _userObj: any = {}

    _userObj.firstName = profile.given_name;
    _userObj.lastName = profile.given_name;
    _userObj.thirdPartyAccount = true;
    _userObj.year = 1; //default year value is the first year

    if (profile.email) {
        _userObj.email = profile.email
    } else {
        throw new UserInputError("Email is not provided");
    }

    try {
        await UserThirdPartySchema.validateAsync(_userObj)
    } catch (e) {
        throw e;
    }

    const userObj = new Student()
    userObj.setValuesFromJSON(_userObj)

    return userObj;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID || "google_client_id",
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET || "TOP_SECRET",
    callbackURL: "/auth/google/redirect"
},
    async function (_accessToken, _refreshToken, profile, done) {
        try {
            const repo = new UserRepo()
            // NOTE: all accounts signing up with google are going to be users 
            // and other types would be ignored anyway 
            // so i will use students repo here no need to do factory
            // const [_, userObj] = UserPersistanceFactory();
            const userObj = await googleInfoToUserInfoMapper(profile);
            const persistedUser = await repo.findOrCreateStudent(userObj);
            return done(null, persistedUser);
        } catch (e) {
            return done(e);
        }
    }
));

export const BlockedJWTMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // get the token from request cookies
    // it will favor the cookies over the body
    let token;
    if (req && (req.cookies || req.body["jwt"]))
      token = req.cookies["jwt"] || req.body["token"];

    try {
        if (await isTokenBlocked(token))
            res.status(401).send("Token Blocked!")
        else
            next()
    } catch (e) {
        res.status(401).send(e.message)
    }
    // return 401 unauthorized
}

export default passport;
