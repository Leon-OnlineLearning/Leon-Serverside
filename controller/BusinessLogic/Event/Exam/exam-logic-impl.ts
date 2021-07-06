import Exam from "@models/Events/Exam";
import UserInputError from "@services/utils/UserInputError";
import { getManager, getRepository } from "typeorm";
import ExamsLogic from "./exam-logic";
import { promises } from "fs";
const mkdir = promises.mkdir;
const appendFile = promises.appendFile;
const writeFile = promises.writeFile;
import { join } from "path";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import { get_video_path } from "@services/Routes/Event/Exam/recording_utils";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import StudentsExams from "@models/JoinTables/StudentExam";
import Student from "@models/Users/Student";
import getBaseURL from "@utils/getBaseURL";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import { ModelsFacade, ModelsFacadeImpl } from "@controller/BusinessLogic/TextClassification/modelFacade";
import { TestExamVideo } from "@controller/BusinessLogic/TextClassification/TestingQuerys/TestQueries";

let upload_folder = process.env["UPLOADED_RECORDING_PATH"] || "/static/recording";
export default class ExamsLogicImpl implements ExamsLogic {

	async postExamProcessing(examId: string, studentId: string): Promise<void> {
		        // get the latest model
        // get course id for exam
        const courseId = await new ExamsLogicImpl().getCourseId(
			examId
        );
        const latestModel = await new ModelLogicImpl().getTheLatestModel(
            courseId
        );
        if (!latestModel) throw new Error("error in latest model");
        // send test request to the server given the course id
        const modelFacade: ModelsFacade = new ModelsFacadeImpl();
        modelFacade.requestTest(
            new TestExamVideo(
                latestModel,
				examId,
				studentId,
            ),
            `${
                process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
                "/text_classification"
            }/Classify_Exams`
        );
	}

    async getExamsByCourse(
        courseId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<Exam[]> {
        // make sure course exist this will throw error if it doesn't
        await new CourseLogicImpl().getCoursesById(courseId);

        const examQb = getRepository(Exam).createQueryBuilder("ex");
        return await examQb
            .where("ex.courseId = :courseId", { courseId: courseId })
            .andWhere("ex.startTime BETWEEN :start AND :end", {
                start: startingFrom,
                end: endingAt,
            })
            .getMany();
    }
    async getStudentExam(
        studentId: string,
        examId: string
    ): Promise<StudentsExams> {
        const student = await getRepository(Student).findOne(studentId);
        if (!student) throw new UserInputError("Invalid student id");
        const exam = await getRepository(Exam).findOne(examId);
        if (!exam) throw new UserInputError("Invalid student id");
        const studentExam = await getRepository(StudentsExams).findOne({
            where: {
                student,
                exam,
            },
        });
        if (!studentExam) throw new UserInputError("User didn't attend exam");
        return studentExam;
    }
    async getStudentExamId(studentId: string, examId: string): Promise<string> {
        return (await this.getStudentExam(studentId, examId)).id;
    }
    async getCourseId(examId: string): Promise<string> {
        const [{ courseId }] = await getManager().query(
            `select "courseId" from exam
            where id = $1`,
            [examId]
        );
        console.log("course id is", courseId);

        return courseId;
    }
    async getExamVideoData(
        studentId: string,
        examId: string
    ): Promise<[string, string]> {
        const studentExam = await getRepository(StudentsExams)
            .createQueryBuilder("se")
            .where("se.examId = :examId", { examId })
            .andWhere("se.studentId = :studentId", { studentId })
            .getOne();
        if (!studentExam) throw new UserInputError("Invalid Student+Exam ids");
        return [`${getBaseURL()}${studentExam.videoPath}`, studentExam.id];
    }

    async storeExamTextClassificationResult(
        studentId: string,
        examId: string,
        report: any
    ) {
        const exam = await getRepository(Exam).findOne(examId);
        if (!exam) throw new UserInputError("Invalid exam id");
        const student = await getRepository(Student).findOne(studentId);
        if (!student) throw new UserInputError("Invalid student id");
        const studentExam = await getRepository(StudentsExams).findOne({
            where: {
                student,
                exam,
            },
        });
        if (!studentExam)
            throw new UserInputError("student didn't attend the exam");
        studentExam.examReport = report;
        const res = await getRepository(StudentsExams).save(studentExam);
        res.videoPath = `${getBaseURL}${res.videoPath}`;
        return res;
    }

    async getExamById(examId: string): Promise<Exam> {
        const res = await getRepository(Exam).findOne(examId, {
            relations: ["questions"],
        });
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
    ): Promise<string> {
        let video_dir = join(upload_folder, examId);

        await mkdir(video_dir, { recursive: true });

        // TODO make sure the chunk order is right
        const filePath = get_video_path(userId, examId);
        if (chunckIndex == 0) {
            await writeFile(filePath, chunk);
        } else {
            await appendFile(filePath, chunk);
        }
        return filePath;
    }
}
