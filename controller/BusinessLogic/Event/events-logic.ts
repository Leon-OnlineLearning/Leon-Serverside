export default interface EventLogic {
    deleteEventById(id: string): Promise<void>;
}
