import Exam from "@models/Events/Exam";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import ExamsLogic from "./exam-logic";
import { mkdir, appendFile } from 'fs/promises'
import { join } from 'path'

let upload_folder = process.env['UPLOADED_RECORDING_PATH'] || 'recordings';
export default class ExamsLogicImpl implements ExamsLogic {
    async getExamById(examId: string): Promise<Exam> {
        const res = await getRepository(Exam).findOne(examId)
        if (res) return res
        else throw new UserInputError("Invalid exam id");
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
    async saveRecording(chunk: Buffer, examId: string, userId: string): Promise<void> {
        let video_dir = join(upload_folder, examId)

        await mkdir(video_dir, { recursive: true })

        // TODO make sure the chunk order is right
        await appendFile(join(video_dir, `${userId}.webm`), chunk)
    }
}