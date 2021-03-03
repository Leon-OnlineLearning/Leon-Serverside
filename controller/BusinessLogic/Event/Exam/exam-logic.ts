import Exam from "@models/Events/Exam";

export default interface ExamsLogic {
    createExam(exam: Exam) : Promise<Exam>;
}