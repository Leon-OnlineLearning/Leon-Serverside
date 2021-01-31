import { DataTypes, Model } from "sequelize"
import sequelize from "@utils/database-connection"
import { hashPassword, comparePasswords } from "@utils/passwords"

class User extends Model {
    static correctPassword = async (email: string, password: string) => {
        const user: any = await User.findOne({
            where: {
                email: email
            }
        })
        return await comparePasswords(password, user["password"])
    }
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
        // this method fails because the password value won't be ready before validation
        // solution: use beforeCreate hook instead
        // async set(value) {
        //     this.setDataValue('password',await hashPassword(value))
        // }
    }
},{
    sequelize,
    modelName: 'User',
    hooks: {
        beforeCreate: async (user: any, _) => {
            user.password = await hashPassword(user.password)
        }
    }
})


export default User;