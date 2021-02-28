import Event from "@models/Events/Event";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(Event)
export default class extends Repository<Event> {

}