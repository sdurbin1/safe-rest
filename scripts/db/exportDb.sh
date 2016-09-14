#!/bin/bash

if [ -z "$1" ]; then
  echo -e "\nUsage: ./scripts/db/exportDb.sh dbName\n"
  exit
fi

DBNAME=$1

rm data/safe/*.json
mongoexport --db $DBNAME --collection 56eaec7a2308db1b1c6f795f --out data/safe/57a4d2c21c5e543405b806cd.json
mongoexport --db $DBNAME --collection 572a16e5fbdcac91218b9a1c --out data/safe/572a16e5fbdcac91218b9a1c.json
mongoexport --db $DBNAME --collection 5748845f8058984023ca43d6 --out data/safe/5748845f8058984023ca43d6.json
mongoexport --db $DBNAME --collection 57a4d2c21c5e543405b806cd --out data/safe/57a4d2c21c5e543405b806cd.json
mongoexport --db $DBNAME --collection analytics --out data/safe/analytics.json
mongoexport --db $DBNAME --collection dashboardgroups --out data/safe/dashboardgroups.json
mongoexport --db $DBNAME --collection dashboards --out data/safe/dashboards.json
mongoexport --db $DBNAME --collection sources --out data/safe/sources.json
mongoexport --db $DBNAME --collection visualizations --out data/safe/visualizations.json
mongoexport --db $DBNAME --collection visualizationtypes --out data/safe/visualizationtypes.json
