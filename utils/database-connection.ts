import { Connection, createConnection, getConnection } from "typeorm"

const connectionInfo = {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || "") || 3306,
    username: process.env.DB_USERNAME || 'leon',
    password: process.env.DB_PASSWORD || 'leon',
    database: process.env.DATABASE_NAME || 'leon',
}

export const initializeDBMSConnection = async () => {
    let connection: Connection;

    // connection = await createConnection(
    //     {
    //         type: "mysql",
    //         // logging: true,
    //         // logger: "simple-console",
    //         ...connectionInfo,
    //         entities: [
    //             __dirname + "/../models/**/*.ts"
    //         ],
    //         extra: { // config dependant on the database 
    //             connectionLimit: process.env["CONNECTION_POOL_SIZE"]
    //         }
    //     }
    // )
    // await connection.synchronize(process.env.TESTING ? true : false);
    connection = await createConnection()
}

export const destructDBMSConnection = async () => {
    await getConnection().close()
}