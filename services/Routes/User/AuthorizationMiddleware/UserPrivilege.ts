import UserTypes from "@models/Users/UserTypes"

/**
 * States the user privileges in other words what can a user of a specific role access
 * Key is user access: Value is account types that can access resources specified to that user type
 */
const UserPrivileges = {
    //  NOTE: i don't think professor should have 
    //  control over students only end-points
    //  That's why i commented out this line
    // [UserTypes.STUDENT]: [UserTypes.STUDENT, UserTypes.PROFESSOR, UserTypes.ADMIN],
    [UserTypes.STUDENT]: [UserTypes.STUDENT, UserTypes.ADMIN],
    [UserTypes.PROFESSOR]: [UserTypes.PROFESSOR, UserTypes.ADMIN],
    [UserTypes.ADMIN]: [UserTypes.ADMIN]
}

export default UserPrivileges;