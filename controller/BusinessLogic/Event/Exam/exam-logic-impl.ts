import Exam from "@models/Events/Exam";
import { getRepository } from "typeorm";
import ExamsLogic from "./exam-logic";

export default class ExamsLogicImpl implements ExamsLogic {
    getExamById(examId: string): Promise<Exam> {
        throw new Error("Method not implemented.");
    }
    updateExam(examId: string, newData: Exam): Promise<Exam> {
        throw new Error("Method not implemented.");
    }
    deleteExamById(examId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getExamsByYear(year: number): Promise<Exam[]> {
        throw new Error("Method not implemented.");
    }
    async createExam(exam: Exam): Promise<Exam> {
        return await getRepository(Exam).save(exam)
    }
}