import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Student from "@models/Users/Student";

export default interface StudentLogic {
    createStudent(student: Student) : Promise<Student>;
    attendLecture(student: Student, lecture: Lecture) : Promise<void>;
    attendExam(student: Student, exam: Exam) : Promise<void>;
    getAllCourses(studentId: string) : Promise<Course[]>;
    // DISCUSS: is this really needed while you got the courses which in turn has lectures in it
    getAllLectures(studentId: string): Promise<Lecture[]>;
    getAllStudents(skip?: number, take?: number): Promise<Student[]>;
    getStudentByEmail(email: string) : Promise<Student | undefined> ;
}