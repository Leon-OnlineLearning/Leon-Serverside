import Department from "@models/Department";
import { Min } from "class-validator";
import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    TableInheritance,
} from "typeorm";

export default abstract class Event {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Min(3)
    title: string;

    @Column()
    startTime: Date; // start access to event

    @Column()
    duration: number; //duration in minutes

    @Column()
    endTime: Date; // time to stop access to event
}
