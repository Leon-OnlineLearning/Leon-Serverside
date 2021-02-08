import sequelize from "@utils/database-connection";
import { DataTypes, Model } from "sequelize";

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
    },
    { sequelize: sequelize }
)

export default Event;