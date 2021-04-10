import Admin from "@models/Users/Admin";
import { AccountWithSimilarEmailExist } from "@models/Users/User";
import { hashPassword } from "@utils/passwords";
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
        const professor = await professorLogic.getProfessorByEmail(admin.email)
        if (professor) throw new AccountWithSimilarEmailExist()
        admin.password = await hashPassword(admin.password)
        return getRepository(Admin).save(admin);
    }
    async deleteAdminById(adminId: string): Promise<void> {
        await getRepository(Admin).delete(adminId)
    }
    updateAdmin(adminId: string, newData: Admin): Promise<Admin> {
        newData.id = adminId;
        return getRepository(Admin).save(newData)
    }
    async getAllAdmins(skip? :number, take?: number): Promise<Admin[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Admin).findAndCount({ skip: _skip, take: _take })
        return res;
    }

}