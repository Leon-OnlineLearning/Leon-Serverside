import Course from "@models/Course";
import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import {
    ChildEntity,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from "typeorm";
import User from "./User";

/**
 * NOTE: professor supports cascading with courses
 */
@Entity()
export default class Professor extends User {
    async summary() {
        const userSummary = await super.summary();
        return {
            ...userSummary,
            coursesIds: this.courses
                ? this.courses.map((course) => course.id)
                : [],
            departmentId: this.department ? this.department.id : undefined,
            examsId: this.exams ? this.exams.map((exam) => exam.id) : [],
        };
    }
    @ManyToMany(() => Course, { cascade: true })
    @JoinTable({name: "professors_courses"})
    courses: Course[];

    @ManyToOne(() => Department, (dep) => dep.professors)
    department: Department;

    @OneToMany(() => Exam, (e) => e.professor)
    exams!: Exam[];

    @OneToMany(() => Lecture, (l) => l.professor)
    lectures!: Lecture[];
}
