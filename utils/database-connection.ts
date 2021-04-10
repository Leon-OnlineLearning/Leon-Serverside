import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import Admin from "@models/Users/Admin";
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
    connection = await createConnection()
    if (process.env.TESTING)
        await connection.synchronize(true);
    if (typeof process.env.BASE_ADMIN_EMAIL === "string" && typeof process.env.BASE_ADMIN_PASSWORD === "string") {
        const adminLogic: AdminLogic = new AdminLogicImpl()
        const baseAdmin = new Admin()
        baseAdmin.email = process.env.BASE_ADMIN_EMAIL
        baseAdmin.password = process.env.BASE_ADMIN_PASSWORD
        baseAdmin.firstName = "base admin fn"
        baseAdmin.lastName = "base admin ln"
        baseAdmin.thirdPartyAccount = false
        await adminLogic.createAdmin(baseAdmin)
    }
}

export const destructDBMSConnection = async () => {
    await getConnection().close()
}