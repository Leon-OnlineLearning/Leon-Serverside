import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import StudentsExams from "@models/JoinTables/StudentExam";
import { ChildEntity, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import User from "./User";

@Entity()
export default class Student extends User {
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
    lectures!: Lecture[]
}