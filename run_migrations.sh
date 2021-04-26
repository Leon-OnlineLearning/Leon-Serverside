#!/us/bin/sh
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run
