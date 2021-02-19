import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { EntityRepository, getConnection, Repository } from "typeorm";

@EntityRepository(Student)
export default class StudentRepo extends Repository<Student>{
    async insertOrIgnore(user: User){
        await getConnection().createQueryBuilder()
        .insert()
        .into(Student)
        .values(user)
        .orIgnore()
        .execute();
    }
}
