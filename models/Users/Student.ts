import Course from "@models/Course";
import Department from "@models/Department";
import StudentsExamData from "@models/JoinTables/StudentExam";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Report from "@models/Report";
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
        const userSummary = await super.summary();
        return {
            ...userSummary,
            departmentId: (await this.department).id,
            year: this.year,
        };
    }

    setValuesFromJSON(student: any) {
        super.setValuesFromJSON(student);
        this.department = student.department;
        this.year = student.year;
    }

    @OneToMany(() => StudentsExamData, (se) => se.student, {
        cascade: true,
        onDelete: "CASCADE",
    })
    studentExam!: StudentsExamData[];

    @OneToMany(() => StudentLectureAttendance, (se) => se.student, {
        onDelete: "CASCADE",
    })
    studentLectureAttendance!: Promise<StudentLectureAttendance[]>;

    @ManyToOne(() => Department, (department) => department.students)
    department!: Department;

    @Column({ default: 0 })
    @Min(1)
    year: number;

    @OneToOne(() => Embedding, { cascade: true })
    @JoinColumn()
    embedding: Promise<Embedding>;

    @OneToMany(() => Report, (report) => report.student)
    reports: Promise<Report[]>;
}
