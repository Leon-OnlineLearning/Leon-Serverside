# Leon-Serverside Dev
![testing status](http://github.com/Leon-OnlineLearning/Leon-Serverside/actions/workflows/testing.yml/badge.svg) ![linter](https://img.shields.io/badge/Linter-prettier-blue)
## NOTE: Download the model/sub model files and extract them to there place in `/static`
[model](https://drive.google.com/file/d/133utos3wheEW0VJWBPXGZ7MrvsY-s8iC/view?usp=sharing)

[sub model](https://drive.google.com/file/d/1wla44u3vOHCqdhoOSAJfqfjPMVbZwxce/view?usp=sharing)
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
populateDB=1 or 0
BLOCK_ON_ERRORS= 1 or 0
DATABASE_NAME=
DB_USERNAME=
DB_PASSWORD=
HOST=
DATABASE_PORT=
UPLOADED_LECTURES_PATH=
SERVER_BASE_DOMAIN=
ML_SO_IO_SERVER_PORT=
ML_SO_IO_SERVER_BASE_D=
UPLOADED_RELATED_TRAINING_PATH=
UPLOADED_NON_RELATED_TRAINING_PATH=
TXT_CLASSIFICATION_TEST_PATH=
LECTURES_TRANSCRIPT_STORAGE=
LECTURES_FILES_STORAGE=
```

## Migraitons
To run migration on you local environment use this command
```bash
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run
# For some reason i can't pass the -n in the scripts
# to generate migraiotn use this command
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:generate -n $MIGRATION_NAME
```

## Text classification Model
you should download the text classification model from [here](https://drive.google.com/file/d/1vzKS674MLBxK_TcY7NAteV3ptonEJROb/view?usp=sharing) and extract it to `static/textclassification/models`
if you want to populate the text classification model

## Testing
## Jest tests
### How to?
- run `npm test`
## Postman tess
### How to?
- Install postman
- Set an environment with `baseUrl` variable to the server url
- Import collection @ `test/integration/postman/Leon.postman_collection.json`
- Run the collection in order
- Set back and watch the results 😁
