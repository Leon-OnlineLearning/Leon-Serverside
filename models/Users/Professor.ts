import Course from "@models/Course";
import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import { ChildEntity, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import User from "./User";

/**
 * NOTE: professor supports cascading with courses
 */
@Entity()
export default class Professor extends User {
    async summary() {
        const userSummary = super.summary()
        return {
            ...userSummary,
            coursesIds: this.courses.map(course => course.id),
            departmentId: this.department.id,
            examsId: this.exams.map(exam => exam.id)
        }
    }
    @ManyToMany(() => Course, { cascade: true })
    @JoinTable()
    courses: Course[]

    @ManyToOne(() => Department, dep => dep.professors)
    department: Department

    @OneToMany(() => Exam, e => e.professor)
    exams!: Exam[]
}