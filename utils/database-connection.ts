import { Sequelize } from "sequelize"

const credentials = {
    database: process.env.DATABASE_NAME || 'leon',
    username: process.env.USERNAME || 'leon',
    password: process.env.PASSWORD  || 'leon',
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