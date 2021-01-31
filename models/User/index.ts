import {DataTypes} from "sequelize"
import sequelize from "@utils/database-connection"

const User = sequelize.define('User', {
    email : {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }

})