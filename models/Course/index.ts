import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import Professor from "@models/Users/Professor";
import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export default class Course {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(() => Lecture, (lec) => lec.course, {
        cascade: true,
        onDelete: "CASCADE",
    })
    lectures: Promise<Lecture[]>;

    // TODO
    /**
     *  use it as a stack add the last test state first
     */
    @Column({ nullable: true, type: "jsonb" })
    lastSentenceTestResults: any;

    @Column({ nullable: true, type: "jsonb" })
    lastFileTestResults: any;

    @Column({
        type: "enum",
        enum: TestRequestStatus,
        default: TestRequestStatus.EMPTY,
    })
    connectionState: TestRequestStatus;

    @OneToMany(() => Exam, (exam) => exam.course, { onDelete: "CASCADE" })
    exams: Promise<Exam[]>;

    @ManyToMany(() => Professor, (prof) => prof.courses)
    professors: Professor[];

    // TODO IMPORTANT (This is a strange typeorm behavior) for "sync" this add onDelete on
    // foreign key on the departments table (the intended behavior) however as you can see
    // I add it inside course entity THIS IS NOT CORRECT!
    // NOTE: using it in migration result the expected behavior, be careful
    // it must be a typeorm bug 😥
    @ManyToOne(() => Department, (dep) => dep.courses, { onDelete: "CASCADE" })
    department: Department;

    @Column()
    year: number;

    @OneToMany(() => TextClassificationModel, (tcm) => tcm.course)
    textClassificationModels: Promise<TextClassificationModel[]>;
}
