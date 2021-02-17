import { ChildEntity } from "typeorm";
import User from "./User";

@ChildEntity()
export default class Professor extends User {
}