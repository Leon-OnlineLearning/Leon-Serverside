import StudentsExams from "@models/JoinTables/StudentExam";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserTypes from "@models/Users/UserTypes";
import { getConnection, getRepository, Repository } from "typeorm";

export default class UserRepo {
    async insertOrIgnore(user: User) {
        await getConnection().createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .orIgnore()
            .execute();
    }

    async getRoleById(id: string) {
        const student = await getRepository(Student).findOne(id)
        if (student) return UserTypes.STUDENT
        const professor = await getRepository(Professor).findOne(id)
        if (professor) return UserTypes.PROFESSOR
        const admin = await getRepository(Admin).findOne(id)
        if (admin) return UserTypes.ADMIN
        else {
            throw new Error("Invalid id");
        }

    }

    // TODO: fix dependencies on this function 
    // change USERS_role to role
    async findUserAndRoleByEmail(email: string) {
        const student = await getRepository(Student).findOne({
            where: {
                email: email
            }
        })
        if (student) return { ...student, role: UserTypes.STUDENT }
        const professor = await getRepository(Professor).findOne({
            where: {
                email: email
            }
        })
        if (professor) return { ...professor, role: UserTypes.PROFESSOR }
        const admin = await getRepository(Admin).findOne({
            where: {
                email: email
            }
        })
        if (admin) return { ...admin, role: UserTypes.ADMIN }
        else return []

    }

    async findUserAndRoleById(id: string) {
        const student = await getRepository(Student).findOne(id)
        if (student) return { ...student, role: UserTypes.STUDENT }
        const professor = await getRepository(Professor).findOne(id)
        if (professor) return { ...professor, role: UserTypes.PROFESSOR }
        const admin = await getRepository(Admin).findOne(id)
        if (admin) return { ...admin, role: UserTypes.ADMIN }
        else {
            throw new Error("Invalid id");
        }
    }
    async findOrCreateStudent(user: User) {
        let res: User | undefined = await getRepository(Student).findOne({ where: { email: user.email } })
        if (res) { return { res, role: UserTypes.STUDENT } }
        res = await getRepository(Professor).findOne({ where: { email: user.email } })
        if (res) { return { res, role: UserTypes.PROFESSOR } }
        res = await getRepository(Admin).findOne({ where: { email: user.email } })
        if (res) { return { res, role: UserTypes.ADMIN } }
        return { ...(await getRepository(Student).save(user)), role: UserTypes.STUDENT }
    }

    // /**
    //  * checks if use with speicifc email exist then return it or undifined if it
    //  * doesn't
    //  * @param email 
    //  * @returns 
    //  */
    // async emailExist(email: string) {
    //     // TODO: [room for improvement] using joins could element these 3 calls into 
    //     // a single one but would complicate the calling logic
    //     // and has a coupling potential 
    //     // so it will be left for later
    //     const student = await getRepository(Student).findOne({
    //         where : {email: email}
    //     })
    //     if (student) return student
    //     const professor = await getRepository(Professor).findOne({
    //         where : { email: email }
    //     })
    //     if (professor) return professor
    //     const admin = await getRepository(Admin).findOne({
    //         where : {email: email}
    //     })
    //     if (admin) return admin
    // }
}