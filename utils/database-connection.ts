import { Sequelize } from "sequelize"

export const connectionInfo = {
    database: process.env.DATABASE_NAME || 'leon',
    username: process.env.USERNAME || 'leon',
    password: process.env.PASSWORD  || 'leon',
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT||"") || 3306
}

const sequelize = new Sequelize(
    {
        ...connectionInfo,
        dialect: 'mysql'
    }
);

export default sequelize;