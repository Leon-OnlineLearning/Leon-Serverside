import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import TextClassificationModelFile from "../TextClassificationModelFile";

@Entity()
export default class TextClassificationFile {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    filePath: string;

    @OneToMany(() => TextClassificationModelFile, (mf) => mf.file)
    modelFile: TextClassificationModelFile;
}
