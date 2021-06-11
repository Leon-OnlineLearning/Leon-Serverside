import Exam from "@models/Events/Exam";
import StudentsExams from "@models/JoinTables/StudentExam";
// import ExamQuestion from "@models/Events/ExamQuestions";

export default interface ExamsLogic {
    createExam(exam: Exam): Promise<Exam>;
    getExamById(examId: string): Promise<Exam>;
    updateExam(examId: string, newData: Exam): Promise<Exam>;
    deleteExamById(examId: string): Promise<void>;
    getExamsByYear(year: number): Promise<Exam[]>;
    getExamByStudentId(studentId: string): Promise<Exam[]>;
    saveRecording(
        chunk: Buffer,
        examId: string,
        userId: string,
        chunkIndex: number
    ): Promise<String>;
    storeExamTextClassificationResult(
        studentId: string,
        examId: string,
        result: any
    ): Promise<any>;
    /**
     * Get the data related to the examination video
     * @param studentId
     * @param examId
     *
     * @returns [videoPath, videoId]
     */
    getExamVideoData(
        studentId: string,
        examId: string
    ): Promise<[string, string]>;
    getCourseId(examId: string): Promise<string>;
    getStudentExam(studentId: string, examId: string): Promise<StudentsExams> ;
    getStudentExamId(studentId: string, examId: string): Promise<string>;
    // addQuestion(question: ExamQuestion): Promise<ExamQuestion>;
    // removeQuestion(questionId: string): Promise<void>;
    // updateQuestion(questionId:string, newData: ExamQuestion): Promise<ExamQuestion>;
}
