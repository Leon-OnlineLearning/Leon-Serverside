import Course from "@models/Course";
import Department from "@models/Department";
import { ChildEntity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import User from "./User";

/**
 * NOTE: professor supports cascading with courses
 */
@ChildEntity()
export default class Professor extends User {
    @ManyToMany(() => Course, { cascade: true })
    @JoinTable()
    courses: Course[]

    @ManyToOne(()=>Department, dep=>dep.professors)
    department: Department

}