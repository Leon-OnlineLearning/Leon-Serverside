import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Student from "@models/Users/Student";

export default interface StudentLogic {
    getAllEvents(studentId: string): Promise<any>;
    createStudent(student: Student): Promise<Student>;
    attendLecture(studentId: string, lectureId: string): Promise<void>;
    attendExam(studentId: string, examId: string): Promise<void>;
    getAllCourses(studentId: string): Promise<Course[]>;
    addCourse(studentId: string, courseId: string): Promise<void>;
    cancelCourse(studentId: string, courseId: string): Promise<void>;
    // DISCUSS: is this really needed while you got the courses which in turn has lectures in it
    getAllLectures(studentId: string): Promise<Lecture[]>;
    getAllStudents(skip?: number, take?: number): Promise<Student[]>;
    getStudentByEmail(email: string): Promise<Student | undefined>;
    updateStudent(studentId: string, newData: Student): Promise<Student>;
    getStudentById(studentId: string): Promise<Student | undefined>;
    getStudentAttendance(studentId:string): Promise<any>;
}