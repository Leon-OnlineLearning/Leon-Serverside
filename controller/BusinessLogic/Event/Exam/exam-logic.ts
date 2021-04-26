import Exam from "@models/Events/Exam";

export default interface ExamsLogic {
    createExam(exam: Exam): Promise<Exam>;
    getExamById(examId: string): Promise<Exam>;
    updateExam(examId: string, newData: Exam): Promise<Exam>;
    deleteExamById(examId: string): Promise<void>;
    getExamsByYear(year: number): Promise<Exam[]>;
    saveRecording(
        chunk: Buffer,
        examId: string,
        userId: string,
        chunkIndex: number
    ): Promise<String>;
}
