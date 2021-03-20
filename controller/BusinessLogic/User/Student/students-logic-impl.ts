import StudentRepo from "@controller/DataAccess/student-repo";
import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import StudentsExams from "@models/JoinTables/StudentExam";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserClassFactory from "@models/Users/UserClassMapper";
import UserPersistanceFactory from "@models/Users/UserFactory";
import UserTypes from "@models/Users/UserTypes";
import { hashPassword } from "@utils/passwords";
import { validateOrReject } from "class-validator";
import { getRepository } from "typeorm";
import AdminLogic from "../Admin/admin-logic";
import AdminLogicImpl from "../Admin/admin-logic-impl";
import StudentLogic from "./students-logic";
import { AccountWithSimilarEmailExist } from "@models/Users/User"
import ProfessorLogic from "../Professor/professors-logic";
import ProfessorLogicIml from "../Professor/professors-logic-impl";


export default class StudentLogicImpl implements StudentLogic {

    async cancelCourse(studentId: string, courseId: string): Promise<void> {
        const student = await getRepository(Student).findOne(studentId)
        if (!student) throw new Error("Student is not found");
        const course = await getRepository(Course).findOne(courseId)
        if (!course) throw new Error("Course is not found")
        student.courses = student.courses.filter(
            course => course.id !== courseId
        )
        getRepository(Student).save(student)
    }

    async addCourse(studentId: string, courseId: string): Promise<void> {
        const student = await getRepository(Student).findOne(studentId)
        if (!student) throw new Error("Student is not found");
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new Error("Course is not found");
        student.courses.push(course)
        await getRepository(Student).save(student)
    }

    async updateStudent(studentId: string, newData: Student): Promise<Student> {
        const student = await this.getStudentById(studentId)
        if (!student) throw new Error("Student doesn't exist");
        student.setValuesFromJSON(newData)
        return await getRepository(Student).save(student);
    }

    getStudentById(studentId: string): Promise<Student | undefined> {
        return getRepository(Student).findOne(studentId);
    }

    getStudentByEmail(email: string): Promise<Student | undefined> {
        return getRepository(Student).findOne({
            where: { email: email }
        })
    }
    async getAllStudents(skip: number, take: number): Promise<Student[]> {
        console.log("here");

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


    /**
     * Creat new student assume password is no hashed yet
     * @param student 
     * @returns resulted student
     */
    async createStudent(student: Student): Promise<Student> {
        const adminLogic: AdminLogic = new AdminLogicImpl()
        const admin = await adminLogic.getAdminByEmail(student.email)
        if (admin) throw new AccountWithSimilarEmailExist()
        const professorLogic: ProfessorLogic = new ProfessorLogicIml()
        const professor = await professorLogic.getProfessorByEmail(student.email)
        if (professor) throw new AccountWithSimilarEmailExist()

        const repo = getRepository(UserClassFactory(UserTypes.STUDENT))
        student.password = await hashPassword(student.password)
        return await repo.save(student)
    }

    async attendLecture(studentId: string, lectureId: string): Promise<void> {
        const student = await getRepository(Student).findOne(studentId)
        if (!student) { throw new Error("Student is not found") }
        const lecture = await getRepository(Lecture).findOne(lectureId)
        if (!lecture) { throw new Error("Lecture is not found") }
        (await student.lectures).push(lecture)
        await getRepository(Student).save(student)
    }

    async attendExam(studentId: string, examId: string): Promise<void> {
        const student = await getRepository(Student).findOne(studentId)
        if (!student) { throw new Error("Student is not found") }
        const exam = await getRepository(Exam).findOne(examId)
        if (!exam) { throw new Error("Exam is not found") }
        const studentExam = new StudentsExams();
        studentExam.exam = exam;
        studentExam.student = student
        await getRepository(StudentsExams).save(studentExam);
    }
}