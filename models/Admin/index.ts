import User from "@models/User";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

class Admin extends Model{}

Admin.init({
    id : {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    UserId: {
        type: DataTypes.UUID,
        unique: true,
        allowNull:false
    }
}, {
    sequelize: sequelize
})

Admin.belongsTo(User);

export default Admin;