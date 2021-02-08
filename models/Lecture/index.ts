import { DataTypes, Model } from "sequelize"
import sequelize from "@utils/database-connection"
import Course from "@models/Course"
import Department from "@models/Department"
import Event from "@models/Event"
import Professor from "@models/Professor"

class Lecture extends Model { }

Lecture.init({
    Id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, {
    sequelize: sequelize
})

Lecture.belongsTo(Course)
Lecture.belongsTo(Department)
Lecture.belongsTo(Event)
Lecture.belongsTo(Professor)

export default Lecture;