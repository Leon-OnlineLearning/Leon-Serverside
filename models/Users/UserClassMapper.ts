import Student from "@models/Users/Student";
import Admin from "./Admin";
import Professor from "./Professor";
import User from "./User";
import UserTypes from "./UserTypes";

const UserClassMapperConfig = {
    [UserTypes.STUDENT]: Student,
    [UserTypes.PROFESSOR]: Professor,
    [UserTypes.ADMIN]: Admin,
};

function UserClassFactory(userType: UserTypes) {
    return UserClassMapperConfig[userType];
}

export default UserClassFactory;
