import Exam from "@models/Events/Exam";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import Student from "@models/Users/Student";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class StudentsExam {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Student, (student) => student.studentExam)
    student!: Student;

    @ManyToOne(() => Exam, (exam) => exam.studentExam)
    exam!: Promise<Exam>;

    @Column({ nullable: true })
    mark: number;

    @Column({ nullable: true, type: "jsonb" })
    examReport: any;

    @Column({
        type: "enum",
        enum: TestRequestStatus,
        default: TestRequestStatus.EMPTY,
    })
    testingStatus: TestRequestStatus;

    @Column({ nullable: true })
    videoPath: string;
}
