import Department from "@models/Department";
import StudentsExams from "@models/JoinTables/StudentExam";
import { ChildEntity, OneToMany, OneToOne } from "typeorm";
import User from "./User";

@ChildEntity()
export default class Student extends User {
    @OneToMany(() => StudentsExams, se => se.student, { onDelete: "CASCADE" })
    studentExam!: StudentsExams[]

    @OneToMany(()=>Department, department=>department.students)
    department!: Department
}