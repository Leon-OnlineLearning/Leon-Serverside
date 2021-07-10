import {
    ChildEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from "typeorm";
import Event from "@models/Events/Event";
import Course from "@models/Course";
import StudentsExamData from "@models/JoinTables/StudentExam";
import Department from "@models/Department";
import Professor from "@models/Users/Professor";
import Report from "@models/Report";
import ExamQuestion from "./ExamQuestions";

@Entity()
export default class Exam extends Event {
    @Column()
    mark: number;

    @ManyToOne(() => Course, (course) => course.exams)
    course: Course;

    @OneToMany(() => StudentsExamData, (se) => se.exam, { onDelete: "CASCADE" })
    studentExam!: StudentsExamData[];

    @ManyToMany(() => Department, (department) => department.exams)
    departments!: Department[];

    @ManyToOne(() => Professor, (p) => p.exams)
    professor!: Professor;

    @OneToMany(() => ExamQuestion, (q) => q.exam, {
        cascade: ["insert"],
    })
    questions: ExamQuestion[];

    @OneToMany(() => Report, (r) => r.exam)
    @JoinColumn()
    reports: Promise<Report>;
}
