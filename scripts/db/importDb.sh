#!/bin/bash

if [ -z "$1" ]; then
  echo -e "\nUsage: ./scripts/db/importDb.sh dbName\n"
  exit
fi

DBNAME=$1

mongoimport --db $DBNAME --collection 56eaec7a2308db1b1c6f795f --file data/safe/56eaec7a2308db1b1c6f795f.json
mongoimport --db $DBNAME --collection 572a16e5fbdcac91218b9a1c --file data/safe/572a16e5fbdcac91218b9a1c.json
mongoimport --db $DBNAME --collection 5748845f8058984023ca43d6 --file data/safe/5748845f8058984023ca43d6.json
mongoimport --db $DBNAME --collection 57a4d2c21c5e543405b806cd --file data/safe/57a4d2c21c5e543405b806cd.json
mongoimport --db $DBNAME --collection analytics --file data/safe/analytics.json
mongoimport --db $DBNAME --collection dashboardgroups --file data/safe/dashboardgroups.json
mongoimport --db $DBNAME --collection dashboards --file data/safe/dashboards.json
mongoimport --db $DBNAME --collection sources --file data/safe/sources.json
mongoimport --db $DBNAME --collection visualizations --file data/safe/visualizations.json
mongoimport --db $DBNAME --collection visualizationtypes --file data/safe/visualizationtypes.json
