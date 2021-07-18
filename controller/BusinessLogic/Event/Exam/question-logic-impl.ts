import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import ExamQuestions from "@models/Events/ExamQuestions";
import ExamQuestion from "@models/Events/ExamQuestions";
import QuestionSolution from "@models/JoinTables/QuestionSolution";
import StudentsExamData from "@models/JoinTables/StudentExam";
import UserInputError from "@services/utils/UserInputError";
import { getRepository, Index } from "typeorm";
import ExamsLogicImpl from "./exam-logic-impl";
import QuestionLogic from "./question-logic";


export default class QuestionLogicImpl implements QuestionLogic {
    async startExam(examId: string, studentId: string): Promise<StudentsExamData> {
        let studentExam = new StudentsExamData();

        const student = await new StudentLogicImpl().getStudentById(studentId)
        if (!student) { throw new Error("Invalid student id") }
        studentExam.student = student;

        const exam = await new ExamsLogicImpl().getExamById(examId);
        if (!exam) { throw new Error("Invalid exam id") }
        studentExam.exam = Promise.resolve(exam);

        studentExam = await getRepository(StudentsExamData).save(studentExam);
        console.debug(`student${studentId} started exam ${examId}`);
        return studentExam
    }


    async getNextQuestion(studentExam: StudentsExamData): Promise<ExamQuestions> {

        let exam = await studentExam.exam

        if (!exam) throw new Error("Invalid exam id")

        const nextIndex = studentExam.currentQuestionIndex + 1

        const question = await this.getQuestionByIndex(exam.id, nextIndex);
        if (question.id) {
            studentExam.currentQuestionIndex = nextIndex;
            await getRepository(StudentsExamData).save(studentExam);
            return question;
        } else { throw new Error("Invalid id") }
    }
    async saveAnswer(answer: QuestionSolution): Promise<void> {
        await getRepository(QuestionSolution).save(answer);

    }
    async getQuestionById(id: string): Promise<ExamQuestion> {
        const res = await getRepository(ExamQuestion).findOne(id);
        if (!res) throw new UserInputError("Invalid res id");
        return res;
    }

    async getQuestionByIndex(examId: string, Index: number): Promise<ExamQuestions> {
        const exam = await new ExamsLogicImpl().getFullExamById(examId);
        if (exam.questions.length <= Index)
            throw new UserInputError("Invalid question index");
        return exam.questions[Index];
    }
}