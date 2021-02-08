import Exam from "@models/Exam";
import Student from "@models/Student";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

class ExamStudentMark extends Model { }

ExamStudentMark.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        mark : {
            type: DataTypes.INTEGER
        }
    }, {
    sequelize: sequelize
}
)

ExamStudentMark.belongsTo(Exam)
ExamStudentMark.belongsTo(Student)

export default ExamStudentMark;