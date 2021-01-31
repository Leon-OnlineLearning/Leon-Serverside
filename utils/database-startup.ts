import sequelize from "./database-connection"

export default async function databaseStartup() {
    try {
        await sequelize.authenticate()
        console.log('database connected successfully');
    } catch (error) {
        console.error('Couldn\'t connect to database', error);
    }
}