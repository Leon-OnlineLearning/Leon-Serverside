import { ChildEntity } from "typeorm";
import User from "./User";

@ChildEntity()
export default class Admin extends User {
}