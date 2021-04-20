import Course from "@models/Course";
import Department from "@models/Department";
import StudentsExams from "@models/JoinTables/StudentExam";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import { Min } from "class-validator";
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import Embedding from "./Embedding";
import User from "./User";

@Entity()
export default class Student extends User {

    async summary() {
        const userSummary = await super.summary()
        return {
            ...userSummary,
            departmentId: this.department.id,
            year: this.year
        }
    }

    setValuesFromJSON(student: any) {
        super.setValuesFromJSON(student)
        this.department = student.department
        this.year = student.year
    }

    @OneToMany(() => StudentsExams, se => se.student, { cascade: true, onDelete: "CASCADE" })
    studentExam!: StudentsExams[]

    @OneToMany(() => StudentLectureAttendance, se => se.student, { onDelete: "CASCADE" })
    studentLectureAttendance!: Promise<StudentLectureAttendance[]>

    @ManyToOne(() => Department, department => department.students)
    department!: Department

    @ManyToMany(() => Course, c => c.students)
    @JoinTable()
    courses: Promise<Course[]>;

    @Column({ default: 0 })
    @Min(1)
    year: number;

    @OneToOne(()=> Embedding)
    @JoinColumn()
    embedding: Promise<Embedding>
}
