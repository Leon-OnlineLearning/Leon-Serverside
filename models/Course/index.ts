import Department from "@models/Department";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

class Course extends Model { }

Course.init(
    {
        Id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        }
    }, {
    sequelize: sequelize
}
)

Course.belongsToMany(Department, {through: 'DEPARTMENTS_COURSES'})
Department.belongsToMany(Course, {through: 'DEPARTMENTS_COURSES'})

export default Course;