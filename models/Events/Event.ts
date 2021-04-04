import Department from "@models/Department";
import { Min } from "class-validator";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, TableInheritance } from "typeorm";

export default abstract class Event {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Min(3)
    title:string

    @Column()
    year:number

    @Column()
    startTime: Date

    @Column()
    endTime: Date

}