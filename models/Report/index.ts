import Exam from "@models/Events/Exam";
import Student from "@models/Users/Student";
import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

export enum IncidentType {
    different_face = "different_face",
    forbidden_object = "forbidden_object",
}

/**
 * A model describing the state of the student in exam between `startingFrom` and `endingAt`
 */
@Entity()
export default class Report {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Student, (student) => student.reports, { cascade: true })
    student: Student;

    @Column({ comment: "time in seconds from begging" })
    startingFrom: number;

    @Column({ comment: "time in seconds from begging" })
    endingAt: number;

    @Column({ comment: "type of incident", type: "enum", enum: IncidentType })
    incident_type: IncidentType;

    // REVIEW is there any use of this
    // @Column({ comment: "list of forbidding objects",  array: true, nullable: true })
    // forbidding_objects: string[]

    @ManyToOne(() => Exam, (e) => e.reports, { cascade: true })
    exam: Exam;
}
