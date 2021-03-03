import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import StudentsExams from "@models/JoinTables/StudentExam";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { getRepository } from "typeorm";
import StudentLogic from "./students-logic";


export default class StudentLogicImpl implements StudentLogic {
    async createStudent(student: Student): Promise<Student> {
        const [repo, _] = UserPersistanceFactory("student")
        return await repo.save(student)
    }

    async attendLecture(student: Student, lecture: Lecture): Promise<void> {
        student.lectures.push(lecture)
        await getRepository(Student).save(student)
    }

    async attendExam(student: Student, exam: Exam): Promise<void> {
        const studentExam = new StudentsExams();
        studentExam.exam = exam;
        studentExam.student = student
        await getRepository(StudentsExams).save(studentExam);
    }
}