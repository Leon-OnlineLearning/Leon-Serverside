import Course from "@models/Course";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

import TextClassificationModelFile from "@models/TextClassification/TextClassificationModelFile";

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
    modelPath: string;

    @Column({ nullable: true })
    dataLanguageModelPath: string;

    @Column({ nullable: true })
    dataClassificationModelPath: string;

    @OneToMany(() => TextClassificationModelFile, (mf) => mf.model)
    modelFile: TextClassificationModelFile;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
}
