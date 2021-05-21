import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Admin from "@models/Users/Admin";
import Student from "@models/Users/Student";
import {
    Connection,
    createConnection,
    getConnection,
    getRepository,
} from "typeorm";
import populateDB from "./populateDB";

export const initializeDBMSConnection = async () => {
    let connection: Connection;
    connection = await createConnection();
    if (parseInt(process.env.SYNC_DB ?? "0")) {
        await connection.synchronize(true);
        if (parseInt(process.env.populateDB ?? "0")) {
            populateDB();
        }
    }
};

export const destructDBMSConnection = async () => {
    await getConnection().close();
};
