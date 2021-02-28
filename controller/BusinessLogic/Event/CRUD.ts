import Event from "@models/Events/Event";
import { getRepository } from "typeorm";

export async function createEvent(event: Event) {
    const repo = getRepository(Event)
    await repo.save(event)
}