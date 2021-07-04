#!/usr/bin/env bash
npx ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run
