import Student from "@models/Users/Student"
import Admin from "./Admin"
import Professor from "./Professor"
import UserTypes from "./UserTypes";

const UserClassMapper = {
    [UserTypes.STUDENT]: Student,
    [UserTypes.PROFESSOR]: Professor,
    [UserTypes.ADMIN]: Admin
}

export default UserClassMapper;