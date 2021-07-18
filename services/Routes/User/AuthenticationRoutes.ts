import express from "express";
import passport from "@services/Auth";
import {
    blockId,
    generateAccessToken,
    generateRefreshToken,
    isTokenValidAndExpired,
    getPayloadFromJWTNoExpiration,
    getUserFromJWT,
} from "@controller/Tokens";
import { IdTokenClient, OAuth2Client } from "google-auth-library";
import { googleInfoToUserInfoMapper } from "@services/Auth";
import UserRepo from "@controller/DataAccess/user-repo";
import rateLimiter from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimiter({
    windowMs: 30 * 1000,
    max: 6,
});

const refreshTokenLimiter = rateLimiter({
    windowMs: 30 * 1000,
    max: 2,
});

const googleOAuth2Client = new OAuth2Client(
    process.env["GOOGLE_OAUTH2_CLIENT_ID"],
    process.env["GOOGLE_OAUTH2_CLIENT_SECRET"]
);

router.post("/signup", async (req, res) => {
    if (!req.body["email"] || !req.body["password"]) {
        res.status(400).send("email and/or password wasn't provided");
    }
    passport.authenticate("signup", async (error, user) => {
        if (error) {
            res.status(400);
            res.send(error.message);
        }
        if (user) {
            const token = await generateAccessToken(user);
            const refreshToken = await generateRefreshToken(user);
            res.cookie("jwt", token, { httpOnly: true, path: "/" });
            // res.cookie('jwt', token, { path: '/' })
            res.status(201).json({
                success: true,
                token,
                refreshToken,
                email: user["email"],
                firstName: user["firstName"],
                lastName: user["lastName"],
            });
        }
    })(req, res);
});

router.post(
    "/login",
    loginLimiter,
    passport.authenticate("login", { session: false }),
    async (req, res) => {
        const user: any = req.user;

        await login(user, res);
    }
);

async function login(user: any, res: any) {
    const token = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    res.cookie("jwt", token, { httpOnly: true, path: "/" });
    res.json({ success: true, token, refreshToken });
}

router.post(
    "/refreshToken",
    refreshTokenLimiter,
    passport.authenticate("refresh-token", { session: false }),
    async (req, res) => {
        // check if the old token is valid and expired
        let validAndExpired = await isTokenValidAndExpired(
            req.cookies["jwt"] || req.body["token"]
        );
        // if so send new token with payload generated from user call from the id
        // otherwise send 400 bad request

        try {
            if (validAndExpired) {
                const user = await getUserFromJWT(
                    req.cookies["jwt"] || req.body["jwt"]
                );
                const token = await generateAccessToken(user, true);
                res.cookie("jwt", token, { httpOnly: true, path: "/" });
                res.send({
                    success: true,
                    token,
                    message: "new token generated",
                });
            } else {
                throw new Error("Invalid old token state");
            }
        } catch (error: any) {
            res.status(400).send(error.message);
        }
    }
);

router.post("/logout", async (req, res) => {
    const token = req.cookies["jwt"] || req.body["token"];

    try {
        const user: any = await getPayloadFromJWTNoExpiration(token);
        await blockId(user["id"]);
        res.clearCookie("jwt");
        res.status(205).send("logged out!");
    } catch (e: any) {
        res.status(401).send(e.message);
    }
});

// router.get('/google', passport.authenticate('google', {
//     scope: ["profile", "email"],
//     session: false
// }));

const verifyGoogleJwt = async (tokenId: string) => {
    const ticket = await googleOAuth2Client.verifyIdToken({
        idToken: tokenId,
    });
    const payload = ticket.getPayload();

    return payload;
};

router.post("/google", loginLimiter, async (req, res) => {
    const repo = new UserRepo();
    const payload = await verifyGoogleJwt(req.body.tokenId);

    const userObj = await googleInfoToUserInfoMapper(payload);
    const persistedUser = await repo.findOrCreateStudent(userObj);
    await login(persistedUser, res);
});

router.get(
    "/google/redirect",
    passport.authenticate("google", { session: false }),
    async (req: any, res) => {
        await login(req.user, res);
    }
);

export default router;
