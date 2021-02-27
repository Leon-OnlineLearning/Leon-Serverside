import Course from "@models/Course";
import Department from "@models/Department";
import Professor from "@models/Users/Professor";
import { IsFQDN, Max } from "class-validator";
import { ChildEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne } from "typeorm";
import Event from "./Event";

@Entity()
export default class Lecture extends Event{
    @Column()
    @Max(2048)
    @IsFQDN() // TODO this might change 
    path: string

    @ManyToOne(()=>Course, course => course.lectures)
    course: Course

    @OneToOne(()=>Professor)
    @JoinColumn()
    professor: Professor

    @ManyToMany(()=>Department, department => department.lectures)
    departments! : Department[]
}