import Course from "@models/Course";
import Department from "@models/Department";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import UserInputError from "@services/utils/UserInputError";
import { createQueryBuilder, getRepository } from "typeorm";
import DepartmentsLogic from "./departments-logic";

export default class DepartmentsLogicImpl implements DepartmentsLogic {

    async addCourseToDepartment(departmentId: string, courseId: any) {
        const department = await getRepository(Department).findOne(departmentId);
        if (!department) throw new UserInputError("Invalid Department Id");
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new UserInputError("Invalid Course Id");
        (await department.courses).push(course);
        getRepository(Department).save(department)
    }

    async addProfessorToDepartment(departmentId: string, professorId: any): Promise<void> {
        const department = await getRepository(Department).findOne(departmentId, { relations: ["professors"] });
        if (!department) throw new UserInputError("Invalid department Id");
        const professor = await getRepository(Professor).findOne(professorId);
        if (!professor) throw new UserInputError("Invalid professor Id");
        department.professors.push(professor);
        getRepository(Department).save(department);
    }
    async getAllDepartments(skip?: number, take?: number): Promise<Department[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Department).findAndCount({ skip: _skip, take: _take });
        return res;
    }
    async getDepartmentById(departmentId: string): Promise<Department> {
        const res = await getRepository(Department).findOne(departmentId);
        if (res) return res;
        else throw new UserInputError("Invalid department id");
    }

    async getAllCourse(departmentId: string): Promise<Course[]> {
        const res = await getRepository(Department).createQueryBuilder("department")
            .leftJoinAndSelect("department.courses", "course")
            .where("department.id = :id", { id: departmentId })
            .getOne()
        if (res) return res.courses
        else throw new UserInputError("Invalid department id");
    }

    async getAllProfessor(departmentId: string): Promise<Professor[]> {
        const res = await getRepository(Department).createQueryBuilder()
            .leftJoinAndSelect("department.professors", "professor")
            .where("department.id = :id", { id: departmentId })
            .getOne()
        if (res) return res.professors
        else throw new UserInputError("Invalid department id");
    }

    async getAllStudents(departmentId: string): Promise<Student[]> {
        const res = await getRepository(Department).createQueryBuilder()
            .leftJoinAndSelect("department.students", "student")
            .where("department.id = :id", { id: departmentId })
            .getOne()
        if (res) return res.students
        else throw new UserInputError("Invalid department id");
    }

    async createDepartment(department: Department): Promise<Department> {
        return getRepository(Department).save(department);
    }

    async deleteDepartment(departmentId: string): Promise<void> {
        await getRepository(Department).delete(departmentId);
    }

    async updateDepartment(departmentId: string, newData: Department): Promise<Department> {
        const { id, ...newDepData } = newData
        return await getRepository(Department).save(
            {
                id: departmentId,
                ...newDepData
            }
        );
    }

}