import AdminLogic from "@controller/BusinessLogic/User/Admin/admin-logic";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicIml from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import {
    Connection,
    createConnection,
    getConnection,
    getRepository,
} from "typeorm";

export const initializeDBMSConnection = async () => {
    let connection: Connection;
    connection = await createConnection();
    if (parseInt(process.env.SYNC_DB ?? "0"))
        await connection.synchronize(true);

    if (
        typeof process.env.BASE_ADMIN_EMAIL === "string" &&
        typeof process.env.BASE_ADMIN_PASSWORD === "string"
    ) {
        const adminLogic: AdminLogic = new AdminLogicImpl();
        const baseAdmin = new Admin();
        baseAdmin.email = process.env.BASE_ADMIN_EMAIL;
        baseAdmin.password = process.env.BASE_ADMIN_PASSWORD;
        baseAdmin.firstName = "base admin fn";
        baseAdmin.lastName = "base admin ln";
        baseAdmin.thirdPartyAccount = false;
        await adminLogic.createAdmin(baseAdmin);
    }

    if (
        typeof process.env.BASE_STUDENT_EMAIL === "string" &&
        typeof process.env.BASE_STUDENT_PASSWORD === "string"
    ) {
        const studentlogic: StudentLogic = new StudentLogicImpl();
        const baseStudent = new Student();
        baseStudent.email = process.env.BASE_STUDENT_EMAIL;
        baseStudent.password = process.env.BASE_STUDENT_PASSWORD;
        baseStudent.firstName = "base Student fn";
        baseStudent.lastName = "base Student ln";
        baseStudent.thirdPartyAccount = false;

        await studentlogic.createStudent(baseStudent);
    }
    if (
        typeof process.env.BASE_PROFESSOR_EMAIL === "string" &&
        typeof process.env.BASE_PROFESSOR_PASSWORD === "string"
    ) {
        const professorLogic: ProfessorLogic = new ProfessorLogicIml();
        const professor = new Professor();
        professor.email = process.env.BASE_PROFESSOR_EMAIL;
        professor.password = process.env.BASE_PROFESSOR_PASSWORD;
        professor.firstName = "base professor fn";
        professor.lastName = "base professor ln";
        professor.thirdPartyAccount = false;

        await professorLogic.createProfessor(professor);
    }
};

export const destructDBMSConnection = async () => {
    await getConnection().close();
};
