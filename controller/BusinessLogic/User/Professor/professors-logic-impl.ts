import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Professor from "@models/Users/Professor";
import { getRepository } from "typeorm";
import ProfessorLogic from "./professors-logic"

export default class ProfessorLogicIml implements ProfessorLogic {
    async createProfessor(professor: Professor): Promise<Professor> {
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