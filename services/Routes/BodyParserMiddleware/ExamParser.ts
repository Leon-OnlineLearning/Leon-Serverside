import Joi from "joi";
import BodyParserMiddleware from "./BodyParserMiddleware";
import { Request, Response, NextFunction } from "express";
import Lecture from "@models/Events/Lecture/Lecture";
import Exam from "@models/Events/Exam";
import {
    ExamPartialValidatorSchema,
    ExamValidatorSchema,
} from "@models/Events/validators/ExamValidtor";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import ProfessorLogicImpl from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import QuestionSolution from "@models/JoinTables/QuestionSolution";
import QuestionLogicImpl from "@controller/BusinessLogic/Event/Exam/question-logic-impl";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import StudentsExamData from "@models/JoinTables/StudentExam";
import UserInputError from "@services/utils/UserInputError";

export default class ExamParser implements BodyParserMiddleware {
    parserClosure(validatorSchema: Joi.ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            const exam = new Exam();
            exam.startTime = new Date(req.body.startTime);
            exam.endTime = new Date(req.body.endTime);
            exam.mark = req.body.mark;
            exam.title = req.body.title;
            const professor = await new ProfessorLogicImpl().getProfessorById(
                req.body.professorId
            );
            const course = await new CourseLogicImpl().getCoursesById(
                req.body.courseId
            );
            exam.professor = professor;
            exam.course = course;
            exam.questions = req.body.questions;

            const examReq = req as ExamRequest;
            examReq.exam = exam;
            try {
                await validatorSchema.validateAsync(exam);
                next();
                return;
            } catch (e: any) {
                res.status(400).send({ success: false, message: e.message });
                console.debug(`req was ${req.body}`);
            }
        };
    }
    completeParser = this.parserClosure(ExamValidatorSchema);
    partialParser = this.parserClosure(ExamPartialValidatorSchema);
}

export interface ExamRequest extends Request {
    exam: Exam;
}

export interface QuestionRequest extends Request {
    exam: Exam;
    studentExam: StudentsExamData
}

export interface NextQuestionRequest extends QuestionRequest {
    answer: QuestionSolution;
}

const AnswerSchema = Joi.object().keys({
    questionId: Joi.string().required(),
    // TODO change front to send this
    solutionText: Joi.string(),
    solutionChoices: Joi.array().items(Joi.string()),
});

const getQuestionSchema = Joi.object().keys({
    examId: Joi.string().required(),
    studentId: Joi.string().required(),
})

const QuestionNextSchema = getQuestionSchema.keys({
    answer: AnswerSchema.required(),
})


/**
 * parse get Question request: will start exam if student not in one
 * @param req 
 * @param res 
 * @param next 
 */
export async function getQuestionParser(req: Request, res: Response, next: NextFunction) {
    await getQuestionSchema.validateAsync({
        studentId: req.body.studentId,
        examId: req.body.examId
    });

    const questionReq = req as QuestionRequest;

    const exam = await new ExamsLogicImpl().getFullExamById(req.body.examId);
    if (!exam) { throw new UserInputError("Invalid exam id") }
    questionReq.exam = exam;

    let studentExam: StudentsExamData
    try {
        studentExam = await new ExamsLogicImpl().getStudentExam(
            req.body.studentId, req.body.examId);
    } catch (error: any) {
        if (error.message === "User didn't attend exam") {
            studentExam = await new QuestionLogicImpl().startExam(req.body.examId, req.body.studentId)
        } else {
            console.error(error);
            res.status(400).send({ success: false, message: error.message });
            return;
        }
    }
    if (!studentExam) throw new UserInputError("Invalid student id");

    questionReq.studentExam = studentExam;

    next();
}




export async function answerParser(req: Request, res: Response, next: NextFunction) {
    try {
        await QuestionNextSchema.validateAsync({
            answer: req.body.answer,
            studentId: req.body.studentId,
            examId: req.body.examId
        });

        const questionReq = req as NextQuestionRequest;

        const exam = await new ExamsLogicImpl().getFullExamById(req.body.examId);
        if (!exam) { throw new UserInputError("Invalid exam id") }
        questionReq.exam = exam;

        const studentExam = await new ExamsLogicImpl().getStudentExam(
            req.body.studentId, req.body.examId);
        if (!studentExam) throw new UserInputError("invalid studentExam id")
        questionReq.studentExam = studentExam;

        const answer = new QuestionSolution();
        answer.StudentsExamData = studentExam;
        answer.solutionText = req.body.answer?.solutionText;
        answer.solutionChoices = req.body.answer?.solutionChoices;
        const question = await new QuestionLogicImpl().getQuestionById(req.body.answer.questionId);
        if (!question) { throw new Error("Invalid question id") }
        answer.question = question;

        // make sure the answer is for current question
        if (answer.question.id !== exam.questions[studentExam.currentQuestionIndex].id) {

            console.error(question)
            console.debug(`questionId : ${req.body.answer.questionId}`);
            console.debug(`answer.question.id: ${answer.question.id}`);
            console.debug(`index ${studentExam.currentQuestionIndex
                },id: ${exam.questions[studentExam.currentQuestionIndex].id}`);
            throw new Error("you cannot answer different question");
        }

        questionReq.answer = answer;

        next();
        return;
    } catch (e: any) {

        res.status(400).send({ success: false, message: e.message });
        console.error(e)
        console.error(e.message)
        console.debug(`req was `);
        console.debug(req.body)
    }
}

