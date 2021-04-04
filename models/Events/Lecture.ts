import Course from "@models/Course";
import Department from "@models/Department";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import { IsFQDN, Max } from "class-validator";
import { ChildEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Event from "./Event";

@Entity()
export default class Lecture extends Event{
    @Column()
    @Max(2048)
    path: string

    @ManyToOne(()=>Course, course => course.lectures)
    course: Promise<Course>

    @OneToMany(() => StudentLectureAttendance, se => se.lecture, { onDelete: "CASCADE" })
    studentLectureAttendance!: Promise<StudentLectureAttendance[]>

    @OneToOne(()=>Professor)
    @JoinColumn()
    professor: Professor

    @ManyToMany(()=>Department, department => department.lectures)
    departments! : Department[]

}