import { Sequelize } from "sequelize"

const credentials = {
    database: process.env.DATABASE_NAME === undefined ? 'leon' : process.env.DATABASE_NAME,
    username: process.env.USERNAME === undefined ? 'leon' : process.env.USERNAME,
    password: process.env.PASSWORD === undefined ? 'leon' : process.env.PASSWORD,
}

const sequelize = new Sequelize(credentials.database,
    credentials.username,
    credentials.password,
    {
        host: process.env.HOST,
        dialect: 'mysql'
    }
);

export default sequelize;