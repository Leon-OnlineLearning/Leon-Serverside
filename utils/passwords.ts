import bcrypt from "bcrypt"
export async function hashPassword(password: unknown, saltRounds: number = 10) {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err)
            else resolve(hash)
        })
    })
}