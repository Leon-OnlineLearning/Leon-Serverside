import { ChildEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import Event  from "@models/Events/Event"
import Course from "@models/Course";
import StudentsExams from "@models/JoinTables/StudentExam";
import Department from "@models/Department";

@Entity()
export default class Exam extends Event{
    @Column()
    mark: number

    @ManyToOne(()=>Course, course=> course.exams)
    course : Course;

    @OneToMany(()=>StudentsExams, se=> se.exam, {onDelete: "CASCADE"})
    studentExam! : StudentsExams[]

    @ManyToMany(()=>Department, department => department.exams)
    departments! : Department[]
}