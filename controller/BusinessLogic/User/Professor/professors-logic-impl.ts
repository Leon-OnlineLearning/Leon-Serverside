import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Professor from "@models/Users/Professor";
import { AccountWithSimilarEmailExist } from "@models/Users/User";
import { getRepository } from "typeorm";
import AdminLogic from "../Admin/admin-logic";
import AdminLogicImpl from "../Admin/admin-logic-impl";
import StudentLogic from "../Student/students-logic";
import StudentLogicImpl from "../Student/students-logic-impl";
import ProfessorLogic from "./professors-logic"

export default class ProfessorLogicIml implements ProfessorLogic {
    getProfessorByEmail(email: string): Promise<Professor | undefined> {
        return getRepository(Professor).findOne({ where: { email } })
    }
    getProfessorById(id: string): Promise<Professor | undefined> {
        return getRepository(Professor).findOne(id)
    }
    async getAllProfessors(skip?: number, take?: number): Promise<Professor[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Professor).findAndCount({ skip: _skip, take: _take })
        return res;
    }
    async createProfessor(professor: Professor): Promise<Professor> {
        // check in student and admin that there is no account with the same email
        const studentLogic : StudentLogic = new StudentLogicImpl()
        const student = await studentLogic.getStudentByEmail(professor.email)
        if (student) throw new AccountWithSimilarEmailExist()
        const adminLogic : AdminLogic = new AdminLogicImpl()
        const admin = await adminLogic.getAdminByEmail(professor.email)
        if (admin) throw new AccountWithSimilarEmailExist()

        return await getRepository(Professor).save(professor)
    }
    async deleteProfessorById(professorId: string): Promise<void> {
        await getRepository(Professor).delete(professorId);
    }
    async updateProfessor(professorId: string, newData: Professor): Promise<Professor> {
        const { id, ...newProfData } = newData
        return await getRepository(Professor).save({
            id: professorId,
            ...newProfData
        })
    }
    async getAllExams(professorId: string): Promise<Exam[]> {
        const res = await getRepository(Professor).createQueryBuilder()
            .leftJoinAndSelect("professor.exams", "exam")
            .where("professor.id = id", { id: professorId })
            .getOne()
        if (res) return res.exams
        else throw new Error("Invalid professor id");
    }
    async getAllCourses(professorId: string): Promise<Course[]> {
        const res = await getRepository(Professor).createQueryBuilder()
            .leftJoinAndSelect("professor.courses", "course")
            .where("professor.id = :id", { id: professorId })
            .getOne()
        if (res) return res.courses
        else throw new Error("Invalid professor id")
    }

}