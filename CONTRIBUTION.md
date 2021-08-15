# Contribution guide

## Coding guide
1) Check the project board (kanban board) to see if the new feature was implemented and/or someone is working on it right now
2) Make sure that you follow the folder structure of the project
3) If you changed anything in the model layer make sure that you that you create a migration for it with
```
bash ./create_migration.sh <migration_name>
```
## Testing guide
1) Make sure that your branches are covered
2) Avoid using postman for testing we are in the process of migrating from it to superttest 
### Test running
1) to run jest tests 
```
npm run test
```
2) to run postman tests 

    2.1. set the baseUrl variable in your enviroment 

    2.2. load the the collection in `integration/postman`

    2.3. run tests

## Troubleshooting
Please post the full log of the error with a summary for you scenario. you can get the backend log with 
```
docker-compose logs backend
```