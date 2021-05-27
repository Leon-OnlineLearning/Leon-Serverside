import { Column, PrimaryGeneratedColumn } from "typeorm";

export enum FileType {
    RELATED = "related",
    NON_RELATED = "non-related",
}

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
}
