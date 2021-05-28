import { Column, Entity, ManyToOne } from "typeorm";
import TextClassificationFile from "../TextClassificationFile";
import TextClassificationModel from "../TextClassificationModel";

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

    @Column()
    related: boolean;

    @Column()
    className: string;
}
