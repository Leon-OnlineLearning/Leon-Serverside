import Course from "@models/Course";
import Department from "@models/Department";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";

export default interface DepartmentsLogic {
    addProfessorToDepartment(departmentId: string, professorId: any): Promise<void>;
    createDepartment(department: Department): Promise<Department>;
    deleteDepartment(departmentId: string): Promise<void>;
    /**
     * Return the new department after update
     */
    updateDepartment(departmentId: string, newData: Department): Promise<Department>;
    getAllCourse(departmentId: string): Promise<Course[]>;
    getAllProfessor(departmentId: string): Promise<Professor[]>;
    getAllStudents(departmentId: string): Promise<Student[]>;
    getDepartmentById(departmentId: string): Promise<Department>;
    getAllDepartments(skip?:number, take?: number): Promise<Department[]>;
}