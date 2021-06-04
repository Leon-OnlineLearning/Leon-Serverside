import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Lecture from "./Lecture";

@Entity()
export default class LectureTranscript {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    filePath: string;

    @OneToOne(() => Lecture, (l) => l.transcript)
    lecture: Lecture;
}
