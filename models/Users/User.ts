import { IsEmail } from "class-validator"
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm"

export class NonExistingUser extends Error {
    constructor(message: string) {
        super(message)
        this.message = message
        this.name = 'NonExistingUser'
    }
}

@Entity({ name: "USERS" })
@TableInheritance({column:{type: "varchar", name: "role" }})
class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false, unique: true })
    @IsEmail()
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ default: false, nullable: true })
    thirdPartyAccount: boolean;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
    lastName: string;

    @BeforeInsert()
    validate() {
        if (!(this.password || this.thirdPartyAccount)) {
            throw new NotPasswordOrThirdParty();
        }
    }
}

class NotPasswordOrThirdParty extends Error {
    constructor(message?: string | undefined) {
        super(message)
        this.message = "Local user assigned without password"
    }
}

export default User;

