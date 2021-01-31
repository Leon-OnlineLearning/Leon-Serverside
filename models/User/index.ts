import { DataTypes } from "sequelize"
import sequelize from "@utils/database-connection"
import { hashPassword } from "@utils/passwords"

export const User = sequelize.define('User', {
    email: {
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
        allowNull: false,
        async set(value) {
            this.setDataValue('password',await hashPassword(value))
        }
    }
})