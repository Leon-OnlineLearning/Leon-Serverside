import Exam from "@models/Events/Exam";
import { getRepository } from "typeorm";
import ExamsLogic from "./exam-logic";

export default class ExamsLogicImpl implements ExamsLogic {
    async getExamById(examId: string): Promise<Exam> {
        const res = await getRepository(Exam).findOne(examId)
        if (res) return res
        else throw new Error("Invalid exam id");
    }

    async updateExam(examId: string, newData: Exam): Promise<Exam> {
        const { id, ...newExamData } = newData
        return await getRepository(Exam).save(
            {
                id: examId,
                ...newExamData
            }
        )
    }

    async deleteExamById(examId: string): Promise<void> {
        await getRepository(Exam).delete(examId)
    }

    async getExamsByYear(year: number): Promise<Exam[]> {
        return await getRepository(Exam)
            .createQueryBuilder()
            .where({ year: year })
            .getMany()
    }

    async createExam(exam: Exam): Promise<Exam> {
        return await getRepository(Exam).save(exam)
    }
}