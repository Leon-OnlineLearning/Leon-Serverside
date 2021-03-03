import Course from "@models/Course";
import Department from "@models/Department";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import DepartmentsLogic from "./departments-logic";

export default class DepartmentsLogicImpl implements DepartmentsLogic {
    getAllCourse(departmentId: string): Promise<Course[]> {
        throw new Error("Method not implemented.");
    }
    getAllProfessor(departmentId: string): Promise<Professor[]> {
        throw new Error("Method not implemented.");
    }
    getAllStudents(departmentId: string): Promise<Student[]> {
        throw new Error("Method not implemented.");
    }
    createDepartment(department: Department): Promise<Department> {
        throw new Error("Method not implemented.");
    }
    deleteDepartment(departmentId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateDepartment(departmentId: string, newData: Department): Promise<Department> {
        throw new Error("Method not implemented.");
    }

}