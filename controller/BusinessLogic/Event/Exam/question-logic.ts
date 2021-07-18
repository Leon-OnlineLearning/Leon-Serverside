import ExamQuestion from "@models/Events/ExamQuestions";
import QuestionSolution from "@models/JoinTables/QuestionSolution";
import StudentExam from "@models/JoinTables/StudentExam";



export default interface QuestionLogic {
    getQuestionById(id: string): Promise<ExamQuestion>;
    getQuestionByIndex(examId: string, Index: number): Promise<ExamQuestion>
    getNextQuestion(studentExam: StudentExam): Promise<ExamQuestion>

    // addQuestion(question: ExamQuestion): Promise<ExamQuestion>;
    // removeQuestion(questionId: string): Promise<void>;
    // updateQuestion(questionId:string, newData: ExamQuestion): Promise<ExamQuestion>;

    saveAnswer(answer: QuestionSolution): Promise<void>;
}