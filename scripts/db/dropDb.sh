#!/bin/bash

if [ -z "$1" ]; then
  echo -e "\nUsage: ./scripts/db/dropDb.sh dbName\n"
  exit
fi

DBNAME=$1

mongo $DBNAME --eval "db.dropDatabase()"
