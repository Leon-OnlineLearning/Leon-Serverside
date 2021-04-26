# Leon-Serverside Dev
![testing status](http://github.com/Leon-OnlineLearning/Leon-Serverside/actions/workflows/testing.yml/badge.svg) ![linter](https://img.shields.io/badge/Linter-prettier-blue)
## .env Example
```
SERVER_PORT=
CONNECTION_POOL_SIZE=
JWT_SECRET=
JWT_REFRESH_SECRET=
INVALID_TOKEN_SERVER=
INVALID_TOKEN_PORT=
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
SYNC_DB=1 or 0
BLOCK_ON_ERRORS= 1 or 0
UPLOADED_LECTURES_PATH=
SERVER_BASE_DOMAIN=
BASE_ADMIN_EMAIL=
BASE_ADMIN_PASSWORD=
ML_SO_IO_SERVER_PORT=
ML_SO_IO_SERVER_BASE_D=
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
## Jest tests
### How to?
- run `npm test`
## Postman tess
### How to?
- Install postman
- Set an environment with `port` variable to the server port in your config
- Import collection @ `test/integration/postman/Leon.postman_collection.json`
- Run the collection in order
- Set back and watch the results 😁
