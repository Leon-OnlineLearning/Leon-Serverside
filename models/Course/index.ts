import Department from "@models/Department";
import Professor from "@models/Professor";
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

Course.belongsToMany(Department, {through: 'DepartmentsCourses'})
Department.belongsToMany(Course, {through: 'DepartmentsCourses'})

Course.belongsTo(Professor)

export default Course;