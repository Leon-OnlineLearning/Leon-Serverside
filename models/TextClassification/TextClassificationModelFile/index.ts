import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import TextClassificationFile from "../TextClassificationFile";
import TextClassificationModel from "../TextClassificationModel";

export enum FileType {
    RELATED = "related",
    NON_RELATED = "non-related",
    TEST = "test",
}

@Entity()
export default class TextClassificationModelFile {
    @ManyToOne(() => TextClassificationModel, (tcm) => tcm.modelFile, {
        primary: true,
    })
    @JoinColumn({
        name: "model_id",
    })
    model: TextClassificationModel;

    @ManyToOne(() => TextClassificationFile, (tcf) => tcf.modelFile, {
        primary: true,
    })
    @JoinColumn({
        name: "file_id",
    })
    file: TextClassificationFile;

    @Column({
        type: "enum",
        enum: FileType,
        name: "file_relation",
    })
    fileRelation: FileType;

    @Column({ default: "testing" })
    className: string;
}
