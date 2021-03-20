import Admin from "@models/Users/Admin";

export default interface AdminLogic {
    createAdmin(admin: Admin) : Promise<Admin>;
    deleteAdminById(adminId: string) : Promise<void>;
    updateAdmin(adminId: string, newData: Admin) : Promise<Admin>;
    getAllAdmins(skip?: number, take?: number): Promise<Admin[]>;
    getAdminById(id: string): Promise<Admin| undefined>;
    getAdminByEmail(email : string): Promise<Admin | undefined>;
}