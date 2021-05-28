import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import TextClassificationModelFile from "../TextClassificationModelFile";

export enum FileType {
    RELATED = "related",
    NON_RELATED = "non-related",
}

@Entity()
export default class TextClassificationFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "enum",
        enum: FileType,
    })
    fileType: FileType;

    @Column()
    filePath: string;

    @OneToMany(() => TextClassificationModelFile, (mf) => mf.file)
    modelFile: TextClassificationModelFile;
}
