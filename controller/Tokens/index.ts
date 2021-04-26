/**
 *
 * DECISIONS AND REASONING ABOUT TOKEN STORAGE IN CACHE DB
 * We should store the online id as keys and isa as value. the following are the
 * reasoning of my choices
 * 1- Storing by id instead on token:
 *      I will block the id inside the token instead of
 *      blocking the token itself; consider the case of changing
 *      privileges while the other user is using its token (it didn't expire)
 *      the second user will be out of sync so it should ReLogin
 * 2- Storing the online id instead of the blocked ids
 *      I will store online id to avoid the case when someone logs into our
 *      system from 2 different end points if it was blocked and then refreshed
 *      the other end point will continue to use our system and become out of
 *      sync which move us to the next decision
 * 3- Storing Issue time as the value instead of some small text or "1" for example
 *      storing the oldest valid issue time will help us identifying the out of
 *      sync request and block them, because the out of sync tokens will be
 *      issued earlier that the oldest valid.
 *
 *   */

import redis from "redis";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import User from "@models/Users/User";
import { getCustomRepository, getRepository } from "typeorm";
import UserRepo from "@controller/DataAccess/user-repo";
import UserInputError from "@services/utils/UserInputError";

const client = redis.createClient({
    host: process.env.INVALID_TOKEN_SERVER || "127.0.0.1",
    port: parseInt(process.env.INVALID_TOKEN_PORT || "") || 6379,
});

client.on("error", (error) => {
    console.error(error);
});

/**
 *
 * @param id
 */
export async function blockId(id: string) {
    // const payload: any = await getPayloadFromJWT(token)
    const blockedKey = `online:${id}`;
    await new Promise((resolve, reject) => {
        client.del(blockedKey, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
}

/**
 * create new entry in the online cached users
 * @param token
 */
export async function registerPayload(payload: any) {
    // use cases
    // 1- login
    const currentTime = Math.floor(Date.now() / 1000).toString();
    return await new Promise((resolve, reject) => {
        // here set not "setex" because token only get registered on login to keep the time of the last login valid; to invalidate out of sync logins
        client.set(`online:${payload.id}`, currentTime, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
}

/**
 * Checks weather or not the token is blocked namespace in cache.
 * @param token
 */
export async function isTokenBlocked(token: string) {
    try {
        const payload: any = await getPayloadFromJWTNoExpiration(token);

        return await new Promise((resolve, reject) => {
            client.get(`online:${payload["id"]}`, (err, reply) => {
                if (err) reject(err);
                else {
                    if (reply)
                        resolve(parseInt(payload["iat"]) < parseInt(reply));
                    else resolve(true);
                }
            });
        });
    } catch (e) {
        throw e;
    }
}

export async function generateAccessToken(user: any, refresh: boolean = false) {
    const payload = {
        id: user["id"],
        firstName: user["firstName"],
        lastName: user["lastName"],
        role: user["role"],
    };

    // if your will refresh no need to create new entries in cache or to renew
    // the old ones because they hold the last login time
    if (!refresh) await registerPayload(payload);
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "leon",
            { expiresIn: "15m" },
            (err, token) => {
                if (err) reject(err);
                else resolve(token);
            }
        );
    });
}

export async function generateRefreshToken(user: any) {
    const payload = {
        id: user["id"],
        firstName: user["firstName"],
        lastName: user["lastName"],
        role: user["role"],
    };
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || "leon_refresh",
            { expiresIn: "1y" },
            (err, token) => {
                if (err) reject(err);
                else resolve(token);
            }
        );
    });
}

export async function isTokenValidAndExpired(token: string): Promise<boolean> {
    try {
        // check if token is valid without checking expiration
        let decoded: any = await getPayloadFromJWTNoExpiration(token);

        // check if token is blocked => invalid
        const blockedToken = await isTokenBlocked(token);

        if (blockedToken) {
            return false;
        }
        // check if token is expired

        if (decoded["exp"] && Date.now() < decoded["exp"]) {
            return false;
        }
    } catch (e) {
        return false;
    }

    return true;
}

export async function getPayloadFromJWTNoExpiration(token: string) {
    if (!token) return Promise.reject(new Error("jwt is not provided"));
    return await new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET || "leon",
            { ignoreExpiration: true },
            (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            }
        );
    });
}

export async function getUserFromJWT(token: string) {
    try {
        const payload: any = await getPayloadFromJWTNoExpiration(token);
        const repo = new UserRepo();
        const user = await repo.findUserAndRoleById(payload["id"]);
        return user;
    } catch (e) {
        throw e;
    }
}

export const closeCacheConnection = async () => {
    await new Promise<void>((resolve) => {
        client.quit(() => {
            resolve();
        });
    });
    // redis.quit() creates a thread to close the connection.
    // We wait until all threads have been run once to ensure the connection closes.
    await new Promise((resolve) => setImmediate(resolve));
};
