import bcrypt from "bcrypt"
export async function hashPassword(password: unknown, saltRounds: number = 10) : Promise<string> {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err)
            else resolve(hash)
        })
    })
}

export async function comparePasswords(input: string, hashedPassword: string) {
    
    return await new Promise((resolve, reject) => {
        bcrypt.compare(input, hashedPassword, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        })
    })
}