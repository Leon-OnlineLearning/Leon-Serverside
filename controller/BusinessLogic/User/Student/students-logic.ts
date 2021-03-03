import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Student from "@models/Users/Student";
import { Profiler } from "inspector";

export default interface StudentLogic {
    createStudent(student: Student) : Promise<Student>;
    attendLecture(student: Student, lecture: Lecture) : Promise<void>;
    attendExam(student: Student, exam: Exam) : Promise<void>;
}