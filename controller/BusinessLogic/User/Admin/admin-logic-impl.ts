import Admin from "@models/Users/Admin";
import { getRepository } from "typeorm";
import AdminLogic from "./admin-logic"

export default class AdminLogicImpl implements AdminLogic {
    createAdmin(admin: Admin): Promise<Admin> {
        return getRepository(Admin).save(admin);
    }
    async deleteAdminById(adminId: string): Promise<void> {
        await getRepository(Admin).delete(adminId)
    }
    updateAdmin(adminId: string, newData: Admin): Promise<Admin> {
        newData.id = adminId;
        return getRepository(Admin).save(newData)
    }
    getAllAdmins(): Promise<Admin[]> {
        return getRepository(Admin).find()
    }

}