import initializeConnection from "./database-connection";
import sequelize from "./database-connection"

// used like that to be treated like a script and execute what's inside it
require("@models/index")

export default async function databaseStartup(redefineSchema: boolean = true) {
    try {
        await initializeConnection()
        console.log('database connected successfully');
    } catch (error) {
        console.error('Couldn\'t connect to database', error);
    }
}