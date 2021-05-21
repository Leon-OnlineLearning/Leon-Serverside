import Exam from "@models/Events/Exam";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum Q_type {
    MultiChoice = "MultiChoice" ,
    SingleChoice = "SingleChoice" ,
    ShortAnswer = "ShortAnswer" ,
    LongAnswer = "LongAnswer" ,
    Image = "Image" ,
    Code = "Code" ,
}


@Entity()
export default class ExamQuestion {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @ManyToOne(() => Exam, (exam) => exam.questions)
    @JoinColumn()
    exam!: Promise<Exam>;

    @Column()
    questionType: Q_type

    @Column()
    questionText: string
    
    // TODO look how image should be managed here
    @Column({nullable:true})
    fig_url?: string; // figure image related to question
    
    @Column("text",{ array: true, nullable:true })
    choices?: string[]; // only used for Q_type.[multi|single]-choice types
    
    @Column({nullable:true})
    code_lang?: string; // only used for Q_type.code specifying the highlight language

}
