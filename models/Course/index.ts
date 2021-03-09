import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Course {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Lecture, lec => lec.course, { cascade: true, onDelete: "CASCADE" })
    lectures: Promise<Lecture[]>

    @OneToMany(() => Exam, exam => exam.course, { cascade: true, onDelete: "CASCADE" })
    exams: Exam[]

    @ManyToMany(()=>Professor, prof=>prof.courses)
    professors: Professor[]

    @ManyToOne(()=>Department, dep => dep.courses)
    departments: Department[]

    @ManyToMany(()=>Student, s=> s.courses)
    students: Promise<Student[]>;
}