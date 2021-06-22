import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Professor from "@models/Users/Professor";
import { AccountWithSimilarEmailExist } from "@models/Users/User";
import { createQueryBuilder, getRepository, QueryFailedError } from "typeorm";
import AdminLogic from "../Admin/admin-logic";
import AdminLogicImpl from "../Admin/admin-logic-impl";
import StudentLogic from "../Student/students-logic";
import StudentLogicImpl from "../Student/students-logic-impl";
import ProfessorLogic from "./professors-logic";
import UserInputError from "@services/utils/UserInputError";
import { hashPassword } from "@utils/passwords";
import EventslogicImpl from "@controller/BusinessLogic/Event/events-logic-impl";
import UserTypes from "@models/Users/UserTypes";

export default class ProfessorLogicIml implements ProfessorLogic {
    getAllEvents(
        professorId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<any> {
        return new EventslogicImpl().getAllEvents(
            UserTypes.PROFESSOR,
            professorId,
            startingFrom,
            endingAt
        );
    }
    async getLectures(professorId: string): Promise<Lecture[]> {
        const professor = await getRepository(Professor).findOne(professorId, {
            relations: ["lectures"],
        });
        if (!professor) throw new UserInputError("Invalid professor Id");
        return professor.lectures;
    }

    async assignLectureToProfessor(
        professorId: string,
        lectureId: string
    ): Promise<void> {
        const professor = await getRepository(Professor).findOne(professorId, {
            relations: ["lectures"],
        });
        if (!professor) throw new UserInputError("Invalid professor Id");
        const lecture = await getRepository(Lecture).findOne(lectureId);
        if (!lecture) throw new UserInputError("Invalid lecture id");
        professor?.lectures.push(lecture);
        await getRepository(Professor).save(professor);
    }

    async assignCourseToProfessor(id: string, courseId: string): Promise<void> {
        let professor;
        let course;
        try {
            const courseLogic: CoursesLogic = new CourseLogicImpl();
            professor = await this.getProfessorById(id);
            course = await courseLogic.getCoursesById(courseId);
        } catch (e) {
            throw e;
        }
        professor.courses = [];
        professor.courses.push(course);
        getRepository(Professor).save(professor);
    }

    getProfessorByEmail(email: string): Promise<Professor | undefined> {
        return getRepository(Professor).findOne({ where: { email } });
    }

    async getProfessorById(id: string): Promise<Professor> {
        const professor = await getRepository(Professor).findOne(id);
        if (!professor) {
            throw new UserInputError("Invalid professor id");
        }
        return professor;
    }
    async getAllProfessors(skip?: number, take?: number): Promise<Professor[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Professor).findAndCount({
            skip: _skip,
            take: _take,
        });
        return res;
    }
    async createProfessor(professor: Professor): Promise<Professor> {
        // check in student and admin that there is no account with the same email
        const studentLogic: StudentLogic = new StudentLogicImpl();
        const student = await studentLogic.getStudentByEmail(professor.email);
        if (student) throw new AccountWithSimilarEmailExist();
        const adminLogic: AdminLogic = new AdminLogicImpl();
        const admin = await adminLogic.getAdminByEmail(professor.email);
        if (admin) throw new AccountWithSimilarEmailExist();
        professor.password = await hashPassword(professor.password);
        try {
            const res = await getRepository(Professor).save(professor);
            return res;
        } catch (e) {
            if (e instanceof QueryFailedError) {
                throw new UserInputError(e.message);
            } else {
                throw e;
            }
        }
    }
    async deleteProfessorById(professorId: string): Promise<void> {
        await getRepository(Professor).delete(professorId);
    }
    async updateProfessor(
        professorId: string,
        newData: Professor
    ): Promise<Professor> {
        const { id, ...newProfData } = newData;
        return await getRepository(Professor).save({
            id: professorId,
            ...newProfData,
        });
    }
    async getAllExams(professorId: string): Promise<Exam[]> {
        const res = await getRepository(Professor)
            .createQueryBuilder("professor")
            .leftJoinAndSelect("professor.exams", "exam")
            .where("professor.id = :id", { id: professorId })
            .getOne();
        if (res) return res.exams;
        else throw new UserInputError("Invalid professor id");
    }

    async getAllCourses(professorId: string): Promise<Course[]> {
        const res: any = await getRepository(Professor)
            .createQueryBuilder("professor")
            .leftJoinAndSelect("professor.courses", "course")
            .where("professor.id = :id", { id: professorId })
            .getOne();

        if (res) {
            if (res.courses) {
                return res.courses;
            } else {
                return [];
            }
        } else throw new UserInputError("Invalid professor id");
    }
}
