import {
    Entity,
    Column,
    Generated,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import Lecture from "./Lecture/Lecture";

@Entity()
export default class AudioRoom {
    /** room id in both audio and data plugin */
    @Column({
        type: "int",
        unique: true,
    })
    @Generated("increment")
    @PrimaryColumn()
    roomId: number;

    /** secret required to modeify the room */
    @Column()
    @Generated("uuid")
    roomSecret: string;

    @Column({
        default: false,
    })
    isAlive: boolean;

    @OneToOne(() => Lecture, (l) => l.liveRoom, { onDelete: "CASCADE" })
    lecture: Lecture;
}
