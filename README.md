# Leon-Serverside Dev

## .env Example
```
DATABASE_NAME=
DB_USERNAME=
DB_PASSWORD=
HOST=
DATABASE_PORT=
SERVER_PORT=
CONNECTION_POOL_SIZE=
JWT_SECRET=
JWT_REFRESH_SECRET=
INVALID_TOKEN_SERVER=
INVALID_TOKEN_PORT=
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
TESTING=1 or 0
BLOCK_ON_ERRORS= 1 or 0
UPLOADED_LECTURES_PATH=
SERVER_BASE_DOMAIN=
```

## Migraitons
To run migration on you local environment use this command
```bash
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run
# For some reason i can't pass the -n in the scripts
# to generate migraiotn use this command
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:generate -n $MIGRATION_NAME
```

## Testing
**DON'T FORGET TO SET TESTING VARIABLE TO TRUE**
## Integration testing
### How to?
- Install postman
- Set an environment with `port` variable to the server port in your config
- Import collection @ `test/integration/postman/Leon.postman_collection.json`
- Run the collection in order
- Set back and watch the results 😁
