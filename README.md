# Leon-Serverside (Core)
This is the coordinator service that takes care of the communication details and handles the business logic in the process.

![testing status](http://github.com/Leon-OnlineLearning/Leon-Serverside/actions/workflows/testing.yml/badge.svg) ![linter](https://img.shields.io/badge/Linter-prettier-blue)
![Licencse](https://img.shields.io/badge/license-CCO-red)
## Getting started
To start the development enviroment you need to do few steps to get the e2e experience to work as expected 
### Download the text classificaion model
Download the [model files](https://drive.google.com/file/d/133utos3wheEW0VJWBPXGZ7MrvsY-s8iC/view?usp=sharing) and extract them to `/static/textclassification/models/`
<!-- [sub model](https://drive.google.com/file/d/1wla44u3vOHCqdhoOSAJfqfjPMVbZwxce/view?usp=sharing) -->

### create a .env file 
copy the `.env.docker` as `.env` and add the paramters according to your needed configurations.

### Migraitons
To run migration on you local environment use the run migration script

**Note:** don't forget to update `ormconfig.json` to match your environment currently it is setup to be used for CI
```bash
bash run_migrations.sh
```
to create migrations check _create migrations_ section in [`CONTRIBUTION.md`](https://github.com/Leon-OnlineLearning/Leon-Serverside/blob/main/CONTRIBUTION.md) file

## Running
You can build the compose here if you don't want to build the entire application in the leon-all repo

