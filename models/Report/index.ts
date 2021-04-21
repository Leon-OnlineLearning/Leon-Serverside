import Exam from "@models/Events/Exam";
import Student from "@models/Users/Student";
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * A model describing the state of the student in exam between `startingFrom` and `endingAt`
 */
@Entity()
export default class Report {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Student, (student) => student.reports, { cascade: true })
  student: Student;

  @ManyToOne(() => Exam, (exam) => exam.reports, { cascade: true })
  exam: Exam;

  @Column()
  startingFrom: Date;

  @Column()
  endingAt: Date;

  @Column({ length: 1 })
  result: string;
}
