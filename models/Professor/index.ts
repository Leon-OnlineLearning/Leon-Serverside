
import User from "@models/User";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

class Professor extends Model{}

Professor.init({
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

Professor.belongsTo(User);

export default Professor;