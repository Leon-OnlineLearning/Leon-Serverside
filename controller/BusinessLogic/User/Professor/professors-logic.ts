import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import Professor from "@models/Users/Professor";

export default interface ProfessorLogic {
    getLectures(professorId: string): Promise<Lecture[]>;
    createProfessor(professor: Professor): Promise<Professor>;
    deleteProfessorById(professorId: string): Promise<void>;
    updateProfessor(
        professorId: string,
        newData: Professor
    ): Promise<Professor>;
    getAllExams(professorId: string): Promise<Exam[]>;
    getAllCourses(professorId: string): Promise<Course[]>;
    getAllProfessors(skip?: number, take?: number): Promise<Professor[]>;
    getProfessorByEmail(email: string): Promise<Professor | undefined>;
    getProfessorById(id: string): Promise<Professor>;
    assignCourseToProfessor(id: string, courseId: string): Promise<void>;
    assignLectureToProfessor(
        professorId: string,
        lectureId: string
    ): Promise<void>;
    setTextClassificationSessionId(
        professorId: string,
        sessionId: string
    ): Promise<void>;
    getTextClassificationSessionId(
        professorId: string
    ): Promise<string | undefined>;
    unsetSessionId(professorId: string): Promise<void>;
}
