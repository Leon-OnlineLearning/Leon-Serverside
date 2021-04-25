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

  @Column({comment:"time in seconds from begging"})
  startingFrom: number;

  @Column({comment:"time in seconds from begging"})
  endingAt: number;

  @ManyToOne(() => Exam, (e) => e.reports, { cascade: true })
  exam: Exam;
}
