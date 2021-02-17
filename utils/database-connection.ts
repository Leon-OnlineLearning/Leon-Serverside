import User from "@models/User"
import { createConnection } from "typeorm"

const connectionInfo = {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || "") || 3306,
    username: process.env.USERNAME || 'leon',
    password: process.env.PASSWORD || 'leon',
    database: process.env.DATABASE_NAME || 'leon',
}

const initializeConnection = async () => {

    const connection = await createConnection(
        {
            type: "mysql",
            ...connectionInfo,
            entities: [
                __dirname + "/../models/**/index.js"
            ]
        }
    )
    await connection.synchronize();
}

export default initializeConnection;