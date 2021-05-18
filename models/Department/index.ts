import Course from "@models/Course";
import Event from "@models/Events/Event";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import { Min } from "class-validator";
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "departments" })
export default class Department {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Min(3)
    name: string;

    @ManyToOne(() => Course, (crs) => crs.department)
    courses: Promise<Course[]>;

    @OneToMany(() => Professor, (prof) => prof.department)
    professors!: Professor[];

    @OneToMany(() => Student, (student) => student.department)
    students!: Student[];

    @ManyToOne(() => Lecture, (l) => l.departments)
    lectures!: Lecture[];

    @ManyToOne(() => Exam, (exam) => exam.departments)
    exams!: Exam[];
}
