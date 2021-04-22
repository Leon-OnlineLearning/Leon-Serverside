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
  @Column("decimal", { array: true, precision: 21, scale: 20 })
  vector: number[];

  @PrimaryGeneratedColumn("uuid")
  id: string;

}
