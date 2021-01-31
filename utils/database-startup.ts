import sequelize from "./database-connection"

export default async function databaseStartup() {
    try {
        await sequelize.authenticate()
        console.log('database connected successfully');
    } catch (error) {
        console.error('Couldn\'t connect to database', error);
    }
    try {
        await sequelize.sync({ force: true })
        console.log('sync to database: DONE');

    } catch (error) {
        console.error('Can\'t synchronize data', error);
    }

}