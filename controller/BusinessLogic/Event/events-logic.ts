import Event from "@models/Events/Event";
import UserTypes from "@models/Users/UserTypes";

export default interface EventLogic {
    deleteEventById(id: string): Promise<void>;
    getAllEvents(
        role: UserTypes,
        studentId: string,
        startingFrom: string,
        endingAt: string
    ): Promise<Event[]>;
}
