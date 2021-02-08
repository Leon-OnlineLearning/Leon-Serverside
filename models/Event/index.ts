import Department from "@models/Department";
import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";
import { getEventTypes } from "./eventTypes";

class Event extends Model { }

Event.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [getEventTypes()]
            }
        },
        year: {
            type: DataTypes.INTEGER,
        }
    },
    { sequelize: sequelize }
)

Event.belongsToMany(Department, {through: 'EventsDepartments'})

export default Event;