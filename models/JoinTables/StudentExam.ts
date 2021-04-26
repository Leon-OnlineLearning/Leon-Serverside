import Exam from "@models/Events/Exam";
import Student from "@models/Users/Student";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class StudentsExams {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Student, (student) => student.studentExam)
    student!: Student;

    @ManyToOne(() => Exam, (exam) => exam.studentExam)
    exam!: Promise<Exam>;

    @Column()
    mark: number;
}
