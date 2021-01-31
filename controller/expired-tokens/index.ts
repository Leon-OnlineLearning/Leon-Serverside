import redis from "redis"

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
        const timeNow = Math.floor(new Date().getTime()/1000)
        const expirationTime = Math.floor( expiresIn - timeNow );
        return await new Promise ((resolve,reject)=> {
            client.setex(`blocked:${token}`, expirationTime, "1", (err, res) => {
                if (err) reject(err)
                else resolve(res)
            })
        })
    } else {
        return await new Promise ((resolve,reject)=> {
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
export async function isTokenBlocked(token:string) {
    return await new Promise((resolve,reject)=> {
        client.get(`blocked:${token}`,(err, reply)=>{
            if (err) reject(err)
            else resolve(reply)
        })
    })
}