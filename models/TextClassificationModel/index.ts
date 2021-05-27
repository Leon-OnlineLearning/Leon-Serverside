import Course from "@models/Course";
import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export default class TextClassificationModel {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Course, (c) => c.textClassificationModels, {
        onDelete: "CASCADE",
    })
    course: Course;

    @Column()
    name: string;

    @ManyToOne(() => TextClassificationModel, (tcm) => tcm.subModules, {
        nullable: true,
    })
    superModule: TextClassificationModel;

    @OneToMany(() => TextClassificationModel, (tcm) => tcm.superModule, {
        nullable: true,
    })
    subModules: TextClassificationModel[];

    @Column({ nullable: true })
    accuracy: string;

    @Column({ nullable: true })
    predictionModelPath: string;

    @Column({ nullable: true })
    rasingModelPath: string;

    @Column({ nullable: true })
    dataLanguageModelPath: string;

    @Column({ nullable: true })
    dataClassificationModelPath: string;
}
