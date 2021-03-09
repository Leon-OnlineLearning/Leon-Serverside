import UserTypes from "@models/Users/UserTypes"

/**
 * States the user privileges in other words what can a user of a specific role access
 */
const UserPrivileges = {
    [UserTypes.STUDENT]: [UserTypes.STUDENT],
    [UserTypes.PROFESSOR]: [UserTypes.STUDENT, UserTypes.PROFESSOR],
    [UserTypes.ADMIN]: [UserTypes.ADMIN, UserTypes.PROFESSOR, UserTypes.STUDENT]
}

export default UserPrivileges;