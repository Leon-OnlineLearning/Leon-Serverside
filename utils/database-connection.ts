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
            logging: true,
            logger: "simple-console",
            ...connectionInfo,
            entities: [
                __dirname + "/../models/**/*.js"
            ]
        }
    )
    await connection.synchronize(true);
}

export default initializeConnection;