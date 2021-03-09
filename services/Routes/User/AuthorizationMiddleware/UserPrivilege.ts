import UserTypes from "@models/Users/UserTypes"

/**
 * States the user privileges in other words what can a user of a specific role access
 * Key is user access: Value is account types that can access resources specified to that user type
 */
const UserPrivileges = {
    [UserTypes.STUDENT]: [UserTypes.STUDENT, UserTypes.PROFESSOR, UserTypes.ADMIN],
    [UserTypes.PROFESSOR]: [UserTypes.PROFESSOR, UserTypes.ADMIN],
    [UserTypes.ADMIN]: [UserTypes.ADMIN]
}

export default UserPrivileges;