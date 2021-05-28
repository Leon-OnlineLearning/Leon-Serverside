import { Column, Entity, ManyToOne } from "typeorm";
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
    model: TextClassificationModel;

    @ManyToOne(() => TextClassificationFile, (tcf) => tcf.modelFile, {
        primary: true,
    })
    file: TextClassificationFile;

    @Column({
        type: "enum",
        enum: FileType,
    })
    fileRelation: boolean;

    @Column()
    className: string;
}
