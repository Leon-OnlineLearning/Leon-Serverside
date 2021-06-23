import Course from "@models/Course";
import Student from "@models/Users/Student";
import User from "@models/Users/User";
import UserPersistanceFactory from "@models/Users/UserFactory";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Student)
export default class StudentRepo extends Repository<Student> {}
