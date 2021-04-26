import Lecture from "@models/Events/Lecture";
import Student from "@models/Users/Student";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class StudentLectureAttendance {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Student, (student) => student.studentLectureAttendance)
    student!: Promise<Student>;

    @ManyToOne(() => Lecture, (lec) => lec.studentLectureAttendance, {
        onDelete: "CASCADE",
    })
    lecture!: Promise<Lecture>;
}
