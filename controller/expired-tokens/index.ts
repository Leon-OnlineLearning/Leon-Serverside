import redis from "redis"

const client = redis.createClient({
    host: process.env.INVALID_TOKEN_SERVER || '127.0.0.1',
    port: parseInt(process.env.INVALID_TOKEN_PORT || "") || 6379
});

client.on("error", (error) => {
    console.error(error)
})

export async function blockToken(token: string, expiresIn: number) {
    return await new Promise ((resolve,reject)=> {
        client.setex(`blocked:${token}`, (-new Date().getTime() + expiresIn)/1000, "1", (err, res) => {
            if (err) reject(err)
            else resolve(res)
        })
    })
}

export async function isTokenBlocked(token:string) {
    return await new Promise((resolve,reject)=> {
        client.get(`blocked:${token}`,(err, reply)=>{
            if (err) reject(err)
            else resolve(reply)
        })
    })
}