import Exam from "@models/Events/Exam";
// import ExamQuestion from "@models/Events/ExamQuestions";

export default interface ExamsLogic {
    createExam(exam: Exam): Promise<Exam>;
    getExamById(examId: string): Promise<Exam>;
    updateExam(examId: string, newData: Exam): Promise<Exam>;
    deleteExamById(examId: string): Promise<void>;
    getExamsByYear(year: number): Promise<Exam[]>;
    getExamByStudentId(studentId: string): Promise<Exam[]>;
    getExamsByCourse(
        courseId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<Exam[]>;
    saveRecording(
        chunk: Buffer,
        examId: string,
        userId: string,
        chunkIndex: number
    ): Promise<string>;
    // addQuestion(question: ExamQuestion): Promise<ExamQuestion>;
    // removeQuestion(questionId: string): Promise<void>;
    // updateQuestion(questionId:string, newData: ExamQuestion): Promise<ExamQuestion>;
}
