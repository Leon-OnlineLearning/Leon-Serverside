import Exam from "@models/Events/Exam";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import Student from "@models/Users/Student";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import QuestionSolution from "./QuestionSolution";

@Entity()
export default class StudentsExamData {
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


    @Column({ nullable: true })
    last_record_primary: Date;

    @Column({ nullable: true })
    last_record_secondary: Date;


    @Column({ default: -1 })
    currentQuestionIndex: number; // question index currently being solved

    @OneToMany(() => QuestionSolution, (A) => A.StudentsExamData)
    questionSolutions: QuestionSolution[]; // question solutions
}
