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
  @Column({ length: 2048 })
  vector: string;

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Student)
  student: Promise<Student>;
}
