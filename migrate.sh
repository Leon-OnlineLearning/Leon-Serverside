#!/usr/bin/env bash
ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run