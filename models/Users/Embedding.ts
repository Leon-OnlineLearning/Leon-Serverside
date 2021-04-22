import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Student from "./Student";

@Entity()
export default class Embedding {
  @Column("decimal", { array: true, precision: 11, scale: 10 })
  vector: number[];

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Student)
  student: Promise<Student>;
}
