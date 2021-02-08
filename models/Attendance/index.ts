import Lecture from "@models/Lecture"
import Student from "@models/Student"
import sequelize from "@utils/database-connection"
import { DataTypes, Model } from "sequelize"

/**
 * Used to record student attendance and add any addition info if needed in the future
 */
class Attendance extends Model { }

Attendance.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
}, {
    sequelize: sequelize
})

Attendance.belongsTo(Lecture)
Attendance.belongsTo(Student)

export default Attendance;