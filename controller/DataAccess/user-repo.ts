import StudentsExams from "@models/JoinTables/StudentExam";
import Admin from "@models/Users/Admin";
import Professor from "@models/Users/Professor";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { EntityRepository, getConnection, getRepository, Repository } from "typeorm";

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
        // const res = await getConnection().createQueryBuilder()
        //     .select("USERS.role")
        //     .from(User, "USERS")
        //     .where("USERS.id = :id", { id: id })
        //     .execute();
        // return res[0]["USERS_role"]

        const student = await getRepository(Student).findOne(id)
        if (student) return "student"
        const professor = await getRepository(Professor).findOne(id)
        if (professor) return "professor"
        const admin = await getRepository(Admin).findOne(id)
        if (admin) return "admin"
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
        if (student) return { ...student, role: "student" }
        const professor = await getRepository(Professor).findOne({
            where: {
                email: email
            }
        })
        if (professor) return { ...professor, role: "professor" }
        const admin = await getRepository(Admin).findOne({
            where: {
                email: email
            }
        })
        if (admin) return { ...admin, role: "admin" }
        else throw new Error("Invalid email");

    }

    async findUserAndRoleById(id: string) {
        const student = await getRepository(Student).findOne(id)
        if (student) return { ...student, role: "student" }
        const professor = await getRepository(Professor).findOne(id)
        if (professor) return { ...professor, role: "professor" }
        const admin = await getRepository(Admin).findOne(id)
        if (admin) return { ...admin, role: "admin" }
        else {
            throw new Error("Invalid id");
        }
    }
    async findOrCreate(user: User) {
        let res: User | undefined = await getRepository(Student).findOne({ where: { email: user.email } })
        if (res) { return { res, role: "student" } }
        res = await getRepository(Professor).findOne({ where: { email: user.email } })
        if (res) { return { res, role: "professor" } }
        res = await getRepository(Admin).findOne({ where: { email: user.email } })
        if (res) { return { res, role: "admin" } }
        return { ...(await getRepository(Student).save(user)), role: "student" }
    }
}