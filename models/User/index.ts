import { DataTypes, Model } from "sequelize"
import sequelize from "@utils/database-connection"
import { hashPassword, comparePasswords } from "@utils/passwords"
import { use } from "passport"

export class NonExistingUser extends Error {
    constructor(message: string) {
        super(message)
        this.message = message
        this.name = 'NonExistingUser'
    }
}

// export class UserWithGoogle extends Model {}

// UserWithGoogle.init(
//     {
//         id: {
//             type: DataTypes.STRING,
//             allowNull: false,
//             primaryKey: true
//         },
//         lastName :{ 
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         firstName :{ 
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         email : {
//             type: DataTypes.STRING,
//             allowNull: false,
//             validate: {
//                 isEmail: true
//             }
//         }
//     }, {
//         sequelize,
//         modelName: 'google_user'
//     }
// )

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
        unique: true,
        validate: {
            isEmail: true
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    thirdPartyCredentials: {
        type: DataTypes.BOOLEAN,
    },
    password: {
        type: DataTypes.STRING,
        validate: {
            isStrongPassword(password: string) {
                return (
                    /[A-Z]/g.test(password) &&
                    /[a-z]/g.test(password) &&
                    /[^a-zA-Z0-9]/g.test(password) &&
                    /[0-9]/g.test(password) &&
                    password.length > 8
                )
            }
        }
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
            if (user.password)
                user.password = await hashPassword(user.password)
        }
    },
    validate: {
        passwordOrThirdParty() {
            return (this.password || this.thirdPartyCredentials) 
        }
    }
})


export default User;