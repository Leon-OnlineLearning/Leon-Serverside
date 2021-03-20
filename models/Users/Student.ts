import Course from "@models/Course";
import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import StudentsExams from "@models/JoinTables/StudentExam";
import { Min } from "class-validator";
import { ChildEntity, Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import User from "./User";

@Entity()
export default class Student extends User {

    async summary() {
        const userSummary = super.summary()
        return {
            ...userSummary,
            examsId: this.studentExam.map(exam => exam.id),
            departmentId: this.department.id,
            lecturesIds: (await (this.lectures)).map(lec => lec.id),
            year: this.year
        }
    }

    @OneToMany(() => StudentsExams, se => se.student, { cascade: true, onDelete: "CASCADE" })
    studentExam!: StudentsExams[]

    @OneToMany(() => Department, department => department.students)
    department!: Department

    // for attendance
    @ManyToMany(() => Lecture, lecture => lecture.students, {
        cascade: true,
    })
    @JoinTable(
        { name: "student_lecture_attendance" }
    )
    lectures!: Promise<Lecture[]>;

    @ManyToMany(() => Course, c => c.students, {
        cascade: true
    })
    courses!: Course[]

    @Column()
    @Min(1)
    year: number;

}