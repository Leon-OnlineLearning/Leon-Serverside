import Course from "@models/Course";
import Department from "@models/Department";
import Student from "@models/Student";
import User from "@models/User";
import sequelize from "./database-connection"

// used like that to be treated like a script and execute what's inside it
require("@models/index")

export default async function databaseStartup(redefineSchema: boolean = true) {
    try {
        await sequelize.authenticate()
        console.log('database connected successfully');
    } catch (error) {
        console.error('Couldn\'t connect to database', error);
    }
    try {
        if (redefineSchema) {
            await sequelize.sync({ alter: true })
            console.log('sync to database: DONE');
        }

    } catch (error) {
        console.error('Can\'t synchronize data', error);
    }

}