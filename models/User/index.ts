import { DataTypes, Model } from "sequelize"
import sequelize from "@utils/database-connection"
import { hashPassword, comparePasswords } from "@utils/passwords"

export class NonExistingUser extends Error {
    constructor(message: string) {
        super(message)
        this.message = message
        this.name = 'NonExistingUser'
    }
}

class User extends Model {
    /**
     * return user if credentials were correct, return false in case of incorrect password 
     * 
     * @param email 
     * @param password 
     */
    // NOTE: it was this to return user in the case of correctness to follow the standards 
    static verifyPassword = async (email: string, password: string) => {
        let user: any;
        try {
            user = await User.findOne({
                where: {
                    email: email
                }
            })
            if (!user) {
                throw new NonExistingUser("Invalid Email!")
            }
        } catch (error) {
            throw error
        }
        let correctPassword = await comparePasswords(password, user["password"])
        if (!correctPassword) {
           return false 
        } else {
            return user
        }
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
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeCreate: async (user: any, _) => {
            user.password = await hashPassword(user.password)
        }
    }
})


export default User;