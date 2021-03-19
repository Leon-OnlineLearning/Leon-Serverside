import Admin from "@models/Users/Admin";
import { AccountWithSimilarEmailExist } from "@models/Users/User";
import { getRepository } from "typeorm";
import ProfessorLogic from "../Professor/professors-logic";
import ProfessorLogicIml from "../Professor/professors-logic-impl";
import StudentLogic from "../Student/students-logic";
import StudentLogicImpl from "../Student/students-logic-impl";
import AdminLogic from "./admin-logic"

export default class AdminLogicImpl implements AdminLogic {
    getAdminById(id: string): Promise<Admin | undefined> {
        return getRepository(Admin).findOne(id)
    }
    getAdminByEmail(email: string): Promise<Admin | undefined> {
        return getRepository(Admin).findOne({ where: { email } })
    }
    async createAdmin(admin: Admin): Promise<Admin> {
        const studentLogic : StudentLogic = new StudentLogicImpl()
        const student = await studentLogic.getStudentByEmail(admin.email)
        if (student) throw new AccountWithSimilarEmailExist()
        const professorLogic : ProfessorLogic = new ProfessorLogicIml() 
        const professor = professorLogic.getProfessorByEmail(admin.email)
        if (professor) throw new AccountWithSimilarEmailExist()

        return getRepository(Admin).save(admin);
    }
    async deleteAdminById(adminId: string): Promise<void> {
        await getRepository(Admin).delete(adminId)
    }
    updateAdmin(adminId: string, newData: Admin): Promise<Admin> {
        newData.id = adminId;
        return getRepository(Admin).save(newData)
    }
    getAllAdmins(): Promise<Admin[]> {
        return getRepository(Admin).find()
    }

}