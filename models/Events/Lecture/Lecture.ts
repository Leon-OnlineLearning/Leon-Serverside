import Course from "@models/Course";
import Department from "@models/Department";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import { IsFQDN, Max } from "class-validator";
import {
    Column,
    Entity,
    Generated,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import AudioRoom from "../AudioRoom";
import Event from "../Event";
import LectureTranscript from "./LectureTranscript";

@Entity()
export default class Lecture extends Event {
    @Column()
    @Max(2048)
    path: string; // stored file associated with lecture

    @Column({ nullable: true })
    recording_path: string;

    @ManyToOne(() => Course, (course) => course.lectures)
    course: Course;

    @OneToMany(() => StudentLectureAttendance, (se) => se.lecture, {
        onDelete: "CASCADE",
    })
    studentLectureAttendance!: Promise<StudentLectureAttendance[]>;

    @OneToOne(() => Professor)
    @JoinColumn()
    professor: Professor;

    @OneToOne(() => LectureTranscript, (lt) => lt.lecture)
    @JoinColumn()
    transcript: LectureTranscript;

    @OneToOne(() => AudioRoom, (audioRoom) => audioRoom.lecture, {
        cascade: true,
    })
    @JoinColumn()
    liveRoom: AudioRoom;
}
