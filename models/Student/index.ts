import { Model, DataTypes } from "sequelize";
import User from "../User";
import sequelize from "@utils/database-connection"
import Department from "@models/Department";


class Student extends Model {}

/* Initiation */
Student.init({
    UserId: {
        type: DataTypes.UUID,
        unique: true
    }, 
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize: sequelize,
    modelName: "Student"
})

/* Associations */ 
Student.belongsTo(User, {
    onDelete: "CASCADE",
    foreignKey: "UserId"
})

Student.belongsTo(Department)

console.log(Student === sequelize.models.Student);


export default Student;