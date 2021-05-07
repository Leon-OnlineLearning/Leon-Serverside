#!/usr/bin/env bash
if [ "$#" -ne 1 ]; then
    echo "Illegal number of parameters"
    echo "Usage create_migtations migration_name"
else
    npx ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:generate -n $1
fi
