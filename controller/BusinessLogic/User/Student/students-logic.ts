import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import StudentsExamData from "@models/JoinTables/StudentExam";
import Embedding from "@models/Users/Embedding";
import Student from "@models/Users/Student";

export default interface StudentLogic {
    /**
     * Get all events from starting from to ending at
     * @param studentId
     * @param startingFrom In ISO8601 format and UTC
     * @param endingAt In ISO8601 format and UTC
     * @return {Array<Event>} events
     */
    getAllEvents(
        studentId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<any>;
    createStudent(student: Student): Promise<Student>;
    attendLecture(studentId: string, lectureId: string): Promise<void>;
    registerExamPath(
        studentId: string,
        examId: string,
        examVideoPath: string
    ): Promise<StudentsExamData>;
    getAllCourses(studentId: string): Promise<Course[]>;
    // DISCUSS: is this really needed while you got the courses which in turn has lectures in it
    getAllLectures(studentId: string): Promise<Lecture[]>;
    getAllStudents(skip?: number, take?: number): Promise<Student[]>;
    getStudentByEmail(email: string): Promise<Student | undefined>;
    updateStudent(studentId: string, newData: Student): Promise<Student>;
    getStudentById(studentId: string): Promise<Student | undefined>;
    getStudentAttendance(studentId: string): Promise<any>;
    getEmbedding(studentId: string): Promise<Embedding>;
    setEmbedding(studentId: string, vector: number[]): Promise<void>;
}
