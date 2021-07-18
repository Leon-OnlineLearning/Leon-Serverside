import Exam from "@models/Events/Exam";
import ExamQuestion from "@models/Events/ExamQuestions";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import Student from "@models/Users/Student";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import StudentsExamData from "./StudentExam";

@Entity()
export default class QuestionSolution {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ExamQuestion, { onDelete: "CASCADE" })
    question: ExamQuestion;

    @Column({ nullable: true })
    solutionText?: string;

    @Column("text", { array: true, nullable: true })
    solutionChoices?: string[]; // only used for Q_type.[multi|single]-choice types

    @ManyToOne(
        () => StudentsExamData,
        (studentsExam) => studentsExam.questionSolutions,
        { onDelete: "CASCADE" }
    )
    @JoinColumn()
    StudentsExamData: StudentsExamData;
}
