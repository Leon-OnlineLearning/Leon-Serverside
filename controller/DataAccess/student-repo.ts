import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { EntityRepository, getConnection, Repository } from "typeorm";

@EntityRepository(Student)
export default class StudentRepo extends Repository<Student>{
    // because the users with the lowers privilege (Students) will signup with third party methods
    async findOrCreate(user: User) {
        const res = await getConnection()
            .createQueryBuilder()
            .select()
            .from(User, "USERS")
            .where("USERS.email = :email", { email: user.email })
            .execute();
        if (res.length !== 0) {
            return res[0];
        } else {
            await getConnection().createQueryBuilder()
                .insert()
                .into(Student)
                .values(user)
                .execute();
            return user;
        }
    }
}
