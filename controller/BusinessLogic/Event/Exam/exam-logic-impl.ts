import Exam from "@models/Events/Exam";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import ExamsLogic from "./exam-logic";
import { promises } from "fs";
const mkdir = promises.mkdir;
const appendFile = promises.appendFile;
const writeFile = promises.writeFile;
import { join } from "path";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";

let upload_folder = process.env["UPLOADED_RECORDING_PATH"] || "recordings";
export default class ExamsLogicImpl implements ExamsLogic {
    async getExamById(examId: string): Promise<Exam> {
        const res = await getRepository(Exam).findOne(examId);
        if (res) return res;
        else throw new UserInputError("Invalid exam id");
    }

    async updateExam(examId: string, newData: Exam): Promise<Exam> {
        const { id, ...newExamData } = newData;
        return await getRepository(Exam).save({
            id: examId,
            ...newExamData,
        });
    }

    async deleteExamById(examId: string): Promise<void> {
        await getRepository(Exam).delete(examId);
    }

    async getExamsByYear(year: number): Promise<Exam[]> {
        return await getRepository(Exam)
            .createQueryBuilder()
            .where({ year: year })
            .getMany();
    }

    async getExamByStudentId(studentId: string): Promise<Exam[]> {
        const studnetLogic = new StudentLogicImpl();
        const courses = await studnetLogic.getAllCourses(studentId);
        let exams: Array<Exam> = [];

        for (const course of courses) {
            const examQb = getRepository(Exam).createQueryBuilder("ex");
            exams = await examQb
                .where("ex.courseId = :courseId", { courseId: course.id })
                .getMany();
        }
        return exams;
    }
    async createExam(exam: Exam): Promise<Exam> {
        return await getRepository(Exam).save(exam);
    }
    /**
     *
     * @param chunk media chunk send by user
     * @param examId
     * @param userId
     * @returns String filePath where chunk is saved
     */
    async saveRecording(
        chunk: Buffer,
        examId: string,
        userId: string,
        chunckIndex: number
    ): Promise<String> {
        let video_dir = join(upload_folder, examId);

        await mkdir(video_dir, { recursive: true });

        // TODO make sure the chunk order is right
        const filePath = join(video_dir, `${userId}.webm`);
        if (chunckIndex == 0) {
            await writeFile(join(video_dir, `${userId}.webm`), chunk);
        } else {
            await appendFile(join(video_dir, `${userId}.webm`), chunk);
        }
        return filePath;
    }
}
