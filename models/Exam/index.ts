import Course from "@models/Course";
import Event from "@models/Event";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

class Exam extends Model { }

Exam.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
    sequelize: sequelize
}
)

Exam.belongsTo(Course)
Exam.belongsTo(Event)

export default Exam;