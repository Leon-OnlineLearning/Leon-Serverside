/**
 * 
 * @name
 * UserInputError
 * 
 * @description 
 * An error related to invalid data state or data sent by user, in other words the errors
 * that must be sent as it is to the user to take an action.
 * usually related to interactions * with database. For example
 * > User input error will arise if jwt is required but not sent 
 */
export default class UserInputError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'UserInputError'
    }
}