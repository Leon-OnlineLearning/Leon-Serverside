import {
    destructDBMSConnection,
    initializeDBMSConnection,
} from "./database-connection";
import { closeCacheConnection } from "@controller/Tokens/index";

// used like that to be treated like a script and execute what's inside it
require("@models/index");

export async function databaseStartup() {
    try {
        await initializeDBMSConnection();
        console.log("database connected successfully");
    } catch (error) {
        console.error("Couldn't connect to database", error);
    }
}

export async function databaseTeardown() {
    await destructDBMSConnection();
    await closeCacheConnection();
}
