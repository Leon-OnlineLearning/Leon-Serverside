import StudentRepo from "@controller/DataAccess/student-repo";
import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import StudentsExams from "@models/JoinTables/StudentExam";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import UserTypes from "@models/Users/UserTypes";
import { getCustomRepository, getRepository, Repository } from "typeorm";
import StudentLogic from "./students-logic";


export default class StudentLogicImpl implements StudentLogic {
    async getAllStudents(skip: number, take: number): Promise<Student[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Student).findAndCount({ skip: _skip, take: _take })
        return res;
    }
    async getAllLectures(studentId: string): Promise<Lecture[]> {
        const student = await getRepository(Student).findOne(studentId);
        if (student) {
            const lectures = await student.lectures
            return lectures;
        }
        else {
            throw new Error("User not found!");
        }
    }

    async getAllCourses(studentId: string): Promise<Course[]> {
        const student = await getRepository(Student).findOne(studentId);
        if (student) {
            const courses = await student.courses

            return courses;
        }
        else {
            throw new Error("User not found!");
        }

    }


    async createStudent(student: Student): Promise<Student> {
        const [repo, _] = UserPersistanceFactory(UserTypes.STUDENT)
        return await repo.save(student)
    }

    async attendLecture(student: Student, lecture: Lecture): Promise<void> {
        (await student.lectures).push(lecture)
        await getRepository(Student).save(student)
    }

    async attendExam(student: Student, exam: Exam): Promise<void> {
        const studentExam = new StudentsExams();
        studentExam.exam = exam;
        studentExam.student = student
        await getRepository(StudentsExams).save(studentExam);
    }
}