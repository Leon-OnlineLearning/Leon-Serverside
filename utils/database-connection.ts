import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import Admin from "@models/Users/Admin";
import { Connection, createConnection, getConnection } from "typeorm"

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