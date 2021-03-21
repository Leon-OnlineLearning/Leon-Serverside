# Leon-Serverside
Backend repository for Leon

## Please Notice the new TESTING variable added it is used to purge all the data 
## in your database config if you have a testing db!
## Requirements
- Mysql
- Redis
- Ts-Node (for development)
- Node (for production)

## `.env` Fields
```
DATABASE_NAME
USERNAME
PASSWORD
HOST
DATABASE_PORT
SERVER_PORT
CONNECTION_POOLS
JWT_SECRET
JWT_REFRESH_SECRET
INVALID_TOKEN_SERVER
INVALID_TOKEN_PORT
GOOGLE_OAUTH2_CLIENT_ID
GOOGLE_OAUTH2_CLIENT_SECRET
TESTING
```
