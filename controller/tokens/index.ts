import redis from "redis"
import jwt from "jsonwebtoken"
import User from "@models/User";

const client = redis.createClient({
    host: process.env.INVALID_TOKEN_SERVER || '127.0.0.1',
    port: parseInt(process.env.INVALID_TOKEN_PORT || "") || 6379
});

client.on("error", (error) => {
    console.error(error)
})

/**
 * Blocks specified token until expiresIn is provided, otherwise it will blocked indefinitely but this is not recommended as the token itself has expiration date.
 * @param token 
 * @param expiresIn 
 */
export async function blockToken(token: string, expiresIn?: number) {
    if (expiresIn) {
        const timeNow = Math.floor(new Date().getTime() / 1000)
        const expirationTime = Math.floor(expiresIn - timeNow);
        return await new Promise((resolve, reject) => {
            client.setex(`blocked:${token}`, expirationTime, "1", (err, res) => {
                if (err) reject(err)
                else resolve(res)
            })
        })
    } else {
        return await new Promise((resolve, reject) => {
            client.set(`blocked:${token}`, "1", (err, res) => {
                if (err) reject(err)
                else resolve(res)
            })
        })
    }
}

/**
 * Checks weather or not the token is in the blocked namespace in cache. 
 * @param token 
 */
export async function isTokenBlocked(token: string) {
    return await new Promise((resolve, reject) => {
        client.get(`blocked:${token}`, (err, reply) => {
            if (err) reject(err)
            else resolve(reply)
        })
    })
}

export async function generateAccessToken(user: any) {

    const payload = { id: user["id"], firstName: user["firstName"], lastName: user["lastName"] }
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_SECRET || 'leon',
            { expiresIn: "15m" },
            (err, token) => {
                if (err) reject(err)
                else resolve(token)
            })
    })
}

export async function generateRefreshToken(user: any) {
    const payload = { id: user["id"], firstName: user["firstName"], lastName: user["lastName"] }
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'leon_refresh',
            { expiresIn: "30d" },
            (err, token) => {
                if (err) reject(err)
                else resolve(token)
            })
    })
}

export async function isTokenValidAndExpired(token: string): Promise<boolean> {

    try {
        // check if token is valid without checking expiration 
        let decoded: any = await getPayloadFromJWT(token)
        // check if token is blocked => invalid
        const blockedToken = await isTokenBlocked(token)
        if (blockedToken) {
            return false
        }
        // check if token is expired
        if (decoded['exp'] && Date.now() < decoded['exp']) {
            return false
        }
    } catch (e) {
        return false
    }

    return true
}

export async function getPayloadFromJWT(token:string) {
   return  await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET || 'leon', { ignoreExpiration: true }, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}

export async function getUserFromJWT(token: string) {
    const payload : any = await getPayloadFromJWT(token)
    const user = await User.findByPk(payload["id"])
    return user
}