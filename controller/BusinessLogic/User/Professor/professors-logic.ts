import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Professor from "@models/Users/Professor";

export default interface ProfessorLogic {
    createProfessor(professor: Professor) : Promise<Professor>;
    deleteProfessorById(professorId: string) : Promise<void>;
    updateProfessor(professorId: string, newData: Professor) : Promise<Professor>;
    getAllExams(professorId:string) : Promise<Exam[]>;
    getAllCourses(professorId: string) : Promise<Course[]>;
    getAllProfessors(): Promise<Professor[]>;
    getProfessorByEmail(email:string): Promise<Professor | undefined>;
    getProfessorById(id: string): Promise<Professor | undefined>;
}