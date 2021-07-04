import { ChildEntity, Entity } from "typeorm";
import User from "./User";

@Entity()
export default class Admin extends User {}
