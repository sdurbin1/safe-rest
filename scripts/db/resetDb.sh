#!/bin/bash

if [ -z "$1" ]; then
  echo -e "\nUsage: ./scripts/db/resetDb.sh dbName\n"
  exit
fi

DBNAME=$1

./scripts/db/dropDb.sh $DBNAME
./scripts/db/importDb.sh $DBNAME
