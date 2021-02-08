import { Model, DataTypes } from "sequelize";
import sequelize from "@utils/database-connection"
import Course from "@models/Course";

class Department extends Model { }

Department.init({
    Id : {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: sequelize
})


export default Department;